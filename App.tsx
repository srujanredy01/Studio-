
import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomePage } from './components/HomePage';
import { Resources } from './components/Resources';
import { Coding } from './components/Coding';
import { News } from './components/News';
import { SavedItems } from './components/SavedItems';
import { AboutPage } from './components/AboutPage';
import { AdminPanel } from './components/AdminPanel';
import { UserProfile } from './components/UserProfile';
import { AISearchModal } from './components/AISearchModal';
import { CodingTopicPage } from './components/CodingTopicPage';
import type { CodingTopic, User } from './types';
import { trackEvent } from './analytics';
import { useAppContext } from './context/DataContext';

type Theme = 'light' | 'dark';
type View = 'home' | 'resources' | 'coding' | 'news' | 'saved' | 'about' | 'admin' | 'profile';

const App: React.FC = () => {
    const [currentView, setCurrentView] = useState<View>('home');
    
    // FIX: Destructure all necessary state and setters for AdminPanel.
    const {
        newsArticles,
        setNewsArticles,
        subjects,
        setSubjects,
        codingTopics,
        setCodingTopics,
        teamMembers,
        setTeamMembers,
        user,
        setUser,
        allUsers,
        setAllUsers,
    } = useAppContext();
    
    // Theme state
    const [theme, setTheme] = useState<Theme>(() => {
        if (typeof window !== 'undefined' && window.localStorage) {
            const storedTheme = window.localStorage.getItem('theme') as Theme;
            return storedTheme || 'light';
        }
        return 'light';
    });
    
    // State for selected coding topic
    const [selectedCodingTopic, setSelectedCodingTopic] = useState<CodingTopic | null>(null);


    // Admin auth state
    const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
        if (typeof window === 'undefined') return false;
        return window.sessionStorage.getItem('isAdminAuthenticated') === 'true';
    });

    // New news notification state
    const [hasNewNews, setHasNewNews] = useState(false);
    const latestArticleId = newsArticles.length > 0 ? Math.max(...newsArticles.map(a => a.id)) : 0;
    
    // AI Search Modal State
    const [isAISearchOpen, setIsAISearchOpen] = useState(false);

    // Effect for the interactive spotlight
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            const { clientX, clientY } = e;
            const rect = (e.target as HTMLElement).getBoundingClientRect();
            if(rect) {
                const x = clientX - rect.left;
                const y = clientY - rect.top;
                document.documentElement.style.setProperty('--mouse-x', `${x}px`);
                document.documentElement.style.setProperty('--mouse-y', `${y}px`);
            }
        };

        window.addEventListener('mousemove', handleMouseMove);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    useEffect(() => {
        // This effect runs once on app load to track a "login" event for the user.
        // It reads directly from localStorage to avoid dependency on the user state object,
        // which could cause re-runs.
        const storedValue = window.localStorage.getItem('userProfile');
        if (storedValue) {
            try {
                const loadedUser: User = JSON.parse(storedValue);
                // Only update if it's a real user, not the default "Guest"
                if (loadedUser && loadedUser.name && loadedUser.name !== 'Guest') {
                    const updatedUser: User = {
                        ...loadedUser,
                        loginCount: (loadedUser.loginCount || 0) + 1,
                        lastLogin: new Date().toISOString(),
                    };
                    // Update the state, which will trigger the usePersistentState hook to save it.
                    setUser(updatedUser);

                    // Also update this user in the allUsers list
                    if (updatedUser.idNumber) {
                        setAllUsers(prevUsers => {
                            const userIndex = prevUsers.findIndex(u => u.idNumber === updatedUser.idNumber);
                            if (userIndex > -1) {
                                const newUsers = [...prevUsers];
                                newUsers[userIndex] = updatedUser;
                                return newUsers;
                            }
                            return prevUsers;
                        });
                    }
                }
            } catch (error) {
                console.error("Failed to parse user profile for login tracking:", error);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Empty dependency array ensures this runs only once on mount.

    // Track initial page view
    useEffect(() => {
        trackEvent('pageView', 'home');
    }, []); // Runs only on initial mount

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const lastSeenArticleId = parseInt(window.localStorage.getItem('lastSeenArticleId') || '0', 10);
            if (latestArticleId > lastSeenArticleId) {
                setHasNewNews(true);
            }
        }
    }, [newsArticles, latestArticleId]);
    
    const handleSetCurrentView = useCallback((view: View) => {
        if (view !== 'coding') {
            setSelectedCodingTopic(null); // Reset selected topic when navigating away
        }

        if (view === 'news' && hasNewNews) {
            setHasNewNews(false);
             if (typeof window !== 'undefined') {
                window.localStorage.setItem('lastSeenArticleId', String(latestArticleId));
            }
        }

        // Gate access to certain features for guest users
        if ((view === 'resources' || view === 'coding' || view === 'news') && user.name === 'Guest') {
            setCurrentView('profile');
            trackEvent('pageView', `profile_redirect_from_${view}`);
            return;
        }

        setCurrentView(view);
        trackEvent('pageView', view);
    }, [hasNewNews, latestArticleId, user.name]);


    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const target = e.target as HTMLElement;
            if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) {
                return;
            }

            if (e.altKey) {
                let view: View | null = null;
                switch (e.key) {
                    case '1': view = 'home'; break;
                    case '2': view = 'resources'; break;
                    case '3': view = 'coding'; break;
                    case '4': view = 'news'; break;
                    case '5': view = 'saved'; break;
                    case '6': view = 'about'; break;
                    case '7': view = 'admin'; break;
                    case '8': view = 'profile'; break;
                }
                if (view) {
                    e.preventDefault();
                    handleSetCurrentView(view);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleSetCurrentView]);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            window.sessionStorage.setItem('isAdminAuthenticated', String(isAdminAuthenticated));
        }
    }, [isAdminAuthenticated]);

    const handleLogin = () => {
        setIsAdminAuthenticated(true);
    };

    const handleAdminLogout = () => {
        setIsAdminAuthenticated(false);
        setCurrentView('home');
    };

    const handleUserLogout = () => {
        setUser({ name: 'Guest', year: null, idNumber: '', interests: [] });
        setCurrentView('home');
        trackEvent('featureUse', 'user_logout');
    };

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        trackEvent('featureUse', 'toggle_theme', { newTheme });
    };

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);
    
    const renderView = () => {
        switch (currentView) {
            case 'home':
                return <HomePage setCurrentView={handleSetCurrentView} />;
            case 'resources':
                return <Resources setCurrentView={handleSetCurrentView} />;
            case 'coding':
                 return selectedCodingTopic ? (
                    <CodingTopicPage 
                        topic={selectedCodingTopic}
                        onBack={() => setSelectedCodingTopic(null)}
                        setCurrentView={handleSetCurrentView}
                    />
                ) : (
                    <Coding 
                        setCurrentView={handleSetCurrentView}
                        onTopicSelect={setSelectedCodingTopic}
                    />
                );
            case 'news':
                return <News setCurrentView={handleSetCurrentView} />;
            case 'saved':
                return <SavedItems 
                    setCurrentView={handleSetCurrentView}
                    setSelectedCodingTopic={setSelectedCodingTopic}
                />;
            case 'about':
                return <AboutPage />;
            case 'admin':
                return (
                    <AdminPanel
                        subjects={subjects}
                        setSubjects={setSubjects}
                        codingTopics={codingTopics}
                        setCodingTopics={setCodingTopics}
                        newsArticles={newsArticles}
                        setNewsArticles={setNewsArticles}
                        teamMembers={teamMembers}
                        setTeamMembers={setTeamMembers}
                        isAdminAuthenticated={isAdminAuthenticated}
                        onLogin={handleLogin}
                        onLogout={handleAdminLogout}
                        user={user}
                        allUsers={allUsers}
                        setAllUsers={setAllUsers}
                        setUser={setUser}
                    />
                );
            case 'profile':
                return <UserProfile setCurrentView={handleSetCurrentView} />;
            default:
                return <HomePage setCurrentView={handleSetCurrentView} />;
        }
    };

    return (
        <div className="flex flex-col min-h-screen">
            <div id="background-gradient"></div>
            
            <Header
                setCurrentView={handleSetCurrentView}
                currentView={currentView}
                theme={theme}
                toggleTheme={toggleTheme}
                setIsAISearchOpen={setIsAISearchOpen}
                hasNewNews={hasNewNews}
                onLogout={handleUserLogout}
            />
            <main className="flex-grow">
                {renderView()}
            </main>
            <Footer setCurrentView={handleSetCurrentView} />
            
            <AISearchModal 
                isOpen={isAISearchOpen}
                onClose={() => setIsAISearchOpen(false)}
                setCurrentView={handleSetCurrentView}
                setSelectedCodingTopic={setSelectedCodingTopic}
            />
        </div>
    );
};

export default App;