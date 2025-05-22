// This script initializes the Firebase database with sample blog posts
// Run this script once to populate your database

import { addDocument } from '../lib/firebase/firebaseUtils';

const BLOG_COLLECTION = 'blogs';

const sampleBlogPosts = [
  {
    title: 'Emerging Market Trends for 2025',
    category: 'Market Analysis',
    date: '2025-05-15',
    desc: 'Analysis of upcoming market trends and how they might affect your investment portfolio in the coming year.',
    img: 'https://images.unsplash.com/photo-1642033697099-309b2078c648?q=80&w=1470&auto=format&fit=crop'
  },
  {
    title: 'The Psychology of Successful Trading',
    category: 'Trading Strategy',
    date: '2025-05-10',
    desc: 'Understanding the mental aspects of trading and how to maintain discipline in volatile markets.',
    img: 'https://images.unsplash.com/photo-1633158829585-23ba8f7c8caf?q=80&w=1470&auto=format&fit=crop'
  },
  {
    title: 'Bitcoin and Ethereum: A Technical Analysis',
    category: 'Cryptocurrency',
    date: '2025-05-05',
    desc: 'In-depth technical analysis of the two leading cryptocurrencies and potential price movements in the coming months.',
    img: 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?q=80&w=1469&auto=format&fit=crop'
  },
  {
    title: 'Building Passive Income Through Dividend Stocks',
    category: 'Investment Strategy',
    date: '2025-04-28',
    desc: 'How to create a sustainable passive income stream by investing in quality dividend-paying stocks.',
    img: 'https://images.unsplash.com/photo-1565514020179-026b5f8dbcf5?q=80&w=1470&auto=format&fit=crop'
  },
  {
    title: 'Essential Risk Management Strategies for Traders',
    category: 'Risk Management',
    date: '2025-04-20',
    desc: 'Practical approaches to managing risk and protecting your capital in unpredictable market conditions.',
    img: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=1470&auto=format&fit=crop'
  },
  {
    title: 'The Top 5 Technical Indicators Every Trader Should Know',
    category: 'Technical Analysis',
    date: '2025-04-15',
    desc: 'A breakdown of the most effective technical indicators and how to implement them in your trading.',
    img: 'https://images.unsplash.com/photo-1543286386-713bdd548da4?q=80&w=1470&auto=format&fit=crop'
  }
];

const initializeBlogPosts = async () => {
  console.log('Starting blog post initialization...');
  
  try {
    const results = [];
    for (const post of sampleBlogPosts) {
      const result = await addDocument(BLOG_COLLECTION, post);
      console.log(`Added post: ${post.title}`);
      results.push(result);
    }
    
    console.log('Blog posts initialization completed successfully!');
    return results;
  } catch (error) {
    console.error('Error initializing blog posts:', error);
    throw error;
  }
};

export default initializeBlogPosts; 