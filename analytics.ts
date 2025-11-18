import type { AnalyticsEvent, User } from './types';

const MAX_ANALYTICS_EVENTS = 200;

export const trackEvent = (type: 'pageView' | 'featureUse', name: string, payload?: Record<string, any>): void => {
    // Ensure this only runs on the client side
    if (typeof window === 'undefined' || !window.localStorage) {
        return;
    }

    try {
        const storedEvents = window.localStorage.getItem('userAnalytics');
        let events: AnalyticsEvent[] = storedEvents ? JSON.parse(storedEvents) : [];

        // Get user from localStorage to associate with the event
        const storedUser = window.localStorage.getItem('userProfile');
        const user: User | null = storedUser ? JSON.parse(storedUser) : null;

        const newEvent: AnalyticsEvent = {
            type,
            name,
            timestamp: new Date().toISOString(),
            userName: user ? user.name : 'Guest',
            ...(payload && { payload }),
        };

        events.push(newEvent);

        if (events.length > MAX_ANALYTICS_EVENTS) {
            events = events.slice(events.length - MAX_ANALYTICS_EVENTS);
        }

        window.localStorage.setItem('userAnalytics', JSON.stringify(events));
    } catch (error) {
        console.error('Error tracking analytics event:', error);
    }
};