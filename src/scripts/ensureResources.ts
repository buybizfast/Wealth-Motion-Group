// This script ensures the Firebase database has the correct resources
// Run this script to populate the database with the sample resources if they don't exist

import { getDocuments, addDocument } from '../lib/firebase/firebaseUtils';

const RESOURCES_COLLECTION = 'resources';

interface Resource {
  category: string;
  categoryLabel: string;
  title: string;
  description: string;
  imageUrl: string;
  link: string;
}

const requiredResources: Resource[] = [
  {
    category: "trading",
    categoryLabel: "Trading Platform",
    title: "Premium Trading Platform",
    description: "A comprehensive trading platform with advanced analytics, live charts, and extended market hours. Includes access to pre-market and after-hours trading with real-time data.",
    imageUrl: "https://images.unsplash.com/photo-1642033697099-309b2078c648?q=80&w=1470&auto=format&fit=crop",
    link: "https://www.youraffiliatelink.com/trading-platform"
  },
  {
    category: "analysis",
    categoryLabel: "Analysis Tool",
    title: "Market Scanner Pro",
    description: "Powerful scanner tool that helps you find the best trade opportunities with custom presets. Identify patterns and trends with institutional-grade algorithms and historical backtesting.",
    imageUrl: "https://images.unsplash.com/photo-1633158829585-23ba8f7c8caf?q=80&w=1470&auto=format&fit=crop",
    link: "https://www.youraffiliatelink.com/market-scanner"
  },
  {
    category: "productivity",
    categoryLabel: "Productivity",
    title: "Advanced Trading Journal",
    description: "Record, track, and analyze your trades to improve your performance and identify patterns. Includes AI-powered trade analysis to identify strengths and weaknesses in your trading strategy.",
    imageUrl: "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?q=80&w=1469&auto=format&fit=crop",
    link: "https://www.youraffiliatelink.com/trading-journal"
  },
  {
    category: "education",
    categoryLabel: "Education",
    title: "Master the Markets Course",
    description: "Comprehensive trading course covering technical analysis, risk management, and trading psychology. Learn from professional traders with years of experience in various market conditions.",
    imageUrl: "https://images.unsplash.com/photo-1543286386-713bdd548da4?q=80&w=1470&auto=format&fit=crop",
    link: "https://www.youraffiliatelink.com/trading-course"
  },
  {
    category: "risk",
    categoryLabel: "Risk Management",
    title: "Position Size Calculator",
    description: "Calculate optimal position sizes based on your risk tolerance and account size. Maximize returns while minimizing risk with advanced portfolio management tools.",
    imageUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=1470&auto=format&fit=crop",
    link: "https://www.youraffiliatelink.com/position-calculator"
  },
  {
    category: "news",
    categoryLabel: "News & Data",
    title: "Financial News Alert Service",
    description: "Get real-time alerts for market-moving news and events tailored to your watchlist. Includes earnings reports, economic data releases, and expert analysis.",
    imageUrl: "https://images.unsplash.com/photo-1565514020179-026b5f8dbcf5?q=80&w=1470&auto=format&fit=crop",
    link: "https://www.youraffiliatelink.com/news-alerts"
  },
  {
    category: "trading",
    categoryLabel: "Trading Platform",
    title: "Charting Suite Pro",
    description: "Professional-grade charting software with over 100 indicators, drawing tools, and custom scripts. Includes cloud synchronization across devices and real-time alerts.",
    imageUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=1470&auto=format&fit=crop",
    link: "https://www.youraffiliatelink.com/charting-suite"
  },
  {
    category: "education",
    categoryLabel: "Education",
    title: "Options Trading Masterclass",
    description: "Learn advanced options strategies from professional traders with over 20 years of experience. Includes live trading sessions and personalized feedback on your trades.",
    imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1470&auto=format&fit=crop",
    link: "https://www.youraffiliatelink.com/options-masterclass"
  },
  {
    category: "analysis",
    categoryLabel: "Analysis Tool",
    title: "AI Market Predictor",
    description: "Cutting-edge artificial intelligence that analyzes market patterns and predicts potential price movements with remarkable accuracy. Train the AI with your own successful trades.",
    imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1470&auto=format&fit=crop",
    link: "https://www.youraffiliatelink.com/ai-predictor"
  }
];

const ensureResources = async (): Promise<any[]> => {
  console.log('Checking existing resources in database...');
  
  try {
    // Get existing resources
    const existingResources = await getDocuments(RESOURCES_COLLECTION);
    console.log(`Found ${existingResources?.length || 0} existing resources`);
    
    // If we have 9 or more resources, assume they're already populated
    if (existingResources && existingResources.length >= 9) {
      console.log('Database already has sufficient resources. Skipping initialization.');
      return existingResources;
    }
    
    // Otherwise, add the required resources
    console.log('Adding required resources to database...');
    const results: any[] = [];
    
    for (const resource of requiredResources) {
      try {
        const result = await addDocument(RESOURCES_COLLECTION, resource);
        console.log(`Added resource: ${resource.title}`);
        results.push(result);
      } catch (error) {
        console.error(`Failed to add resource ${resource.title}:`, error);
      }
    }
    
    console.log(`Successfully added ${results.length} resources to database`);
    return results;
  } catch (error) {
    console.error('Error ensuring resources:', error);
    throw error;
  }
};

export default ensureResources; 