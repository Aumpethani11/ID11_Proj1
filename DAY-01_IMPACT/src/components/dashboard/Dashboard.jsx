import React, { useEffect, useState, useMemo, lazy, Suspense } from "react";
import "./Dashboard.css";
import { useDispatch, useSelector } from "react-redux";
import { getSignData, getTopUsers } from "../../redux/actions/signdataaction";
import Spinner from "../Spinner/Spinner";
import { useNavigate } from "react-router-dom";

// Lazy load dashboard components for better performance
const AnalyticsOverview = lazy(() => import("./AnalyticsOverview"));
const PracticeScheduler = lazy(() => import("./PracticeScheduler"));
const ProgressTracker = lazy(() => import("./ProgressTracker"));
const InteractiveGuide = lazy(() => import("./InteractiveGuide"));

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('analytics');
  const [userGoals, setUserGoals] = useState({
    dailyPractice: 30, // minutes
    weeklyGoals: 5, // signs
    monthlyTarget: 50 // signs
  });

  const { loading: authLoader, accessToken } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!authLoader && !accessToken) {
      navigate("/");
    }
  }, [accessToken, authLoader, navigate]);

  useEffect(() => {
    // Only fetch data once when component mounts
    dispatch(getSignData());
    dispatch(getTopUsers());
  }, [dispatch]);

  const { signDataList, loading } = useSelector((state) => state.signData);

  // Memoize expensive calculations to prevent unnecessary re-renders
  const { TopFiveSignsObject, analytics } = useMemo(() => {
    //create a new object array which contains only signs performed array
    const list = signDataList
      .map((data) => data.signsPerformed)
      .reduce((acc, val) => acc.concat(val), []);

    //add the counts of same sign values
    const newData = [];
    for (let i = 0; i < list.length; i++) {
      const foundIndex = newData.findIndex(
        (d) => d.SignDetected === list[i].SignDetected
      );
      if (foundIndex === -1) {
        newData.push({ ...list[i] });
      } else {
        newData[foundIndex].count += list[i].count;
      }
    }

    const TopFiveSignsObject = newData
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Calculate comprehensive analytics
    const totalSessions = signDataList.length;
    const totalTimeSpent = signDataList.reduce((acc, session) => acc + session.secondsSpent, 0);
    const totalSigns = list.length;
    const uniqueSigns = new Set(list.map(item => item.SignDetected)).size;
    const averageSessionTime = totalSessions > 0 ? totalTimeSpent / totalSessions : 0;
    
    const analytics = {
      totalSessions,
      totalTimeSpent,
      totalSigns,
      uniqueSigns,
      averageSessionTime
    };

    return { TopFiveSignsObject, analytics };
  }, [signDataList]);

  return (
    <div className="signlang_dashboard-container">
      {!(loading || authLoader) ? (
        <>
          {/* Enhanced Dashboard Header */}
          <div className="dashboard-header">
            <h1 className="dashboard-title">Sign Language Recognition Dashboard</h1>
            <p className="dashboard-subtitle">Track your progress and improve your signing skills</p>
          </div>

                {/* Navigation Tabs */}
                <div className="dashboard-tabs">
                  <button 
                    className={`tab-button ${activeTab === 'analytics' ? 'active' : ''}`}
                    onClick={() => setActiveTab('analytics')}
                  >
                    📈 Analytics
                  </button>
            <button 
              className={`tab-button ${activeTab === 'schedule' ? 'active' : ''}`}
              onClick={() => setActiveTab('schedule')}
            >
              📅 Practice Schedule
            </button>
            <button 
              className={`tab-button ${activeTab === 'progress' ? 'active' : ''}`}
              onClick={() => setActiveTab('progress')}
            >
              🎯 Progress Tracker
            </button>
            <button 
              className={`tab-button ${activeTab === 'guide' ? 'active' : ''}`}
              onClick={() => setActiveTab('guide')}
            >
              🎓 Interactive Guide
            </button>
          </div>

                {/* Tab Content */}
                <div className="dashboard-content">
                  <Suspense fallback={<Spinner />}>
                    {activeTab === 'analytics' && (
                      <AnalyticsOverview 
                        signDataList={signDataList} 
                        analytics={analytics}
                        topSigns={TopFiveSignsObject}
                      />
                    )}

                    {activeTab === 'schedule' && (
                      <PracticeScheduler 
                        userGoals={userGoals}
                        setUserGoals={setUserGoals}
                        signDataList={signDataList}
                      />
                    )}

                    {activeTab === 'progress' && (
                      <ProgressTracker 
                        signDataList={signDataList}
                        userGoals={userGoals}
                        analytics={analytics}
                      />
                    )}

                    {activeTab === 'guide' && (
                      <InteractiveGuide 
                        signDataList={signDataList}
                        topSigns={TopFiveSignsObject}
                      />
                    )}
                  </Suspense>
                </div>
        </>
      ) : (
        <Spinner />
      )}
    </div>
  );
};

export default Dashboard;
