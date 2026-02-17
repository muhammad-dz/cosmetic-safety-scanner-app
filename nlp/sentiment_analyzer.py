"""
Sentiment Analysis for Cosmetic Reviews
"""
import nltk
import pandas as pd
import numpy as np
from nltk.sentiment import SentimentIntensityAnalyzer
import glob
import json
import os
from collections import Counter
from datetime import datetime

class CosmeticSentimentAnalyzer:
    def __init__(self):
        self.sia = SentimentIntensityAnalyzer()
        
        # Issue keywords
        self.issue_keywords = {
            'rash': ['rash', 'redness', 'itchy', 'irritation', 'burning'],
            'acne': ['acne', 'breakout', 'pimple'],
            'dryness': ['dry', 'flaky', 'peeling', 'tight'],
            'oiliness': ['oily', 'greasy'],
            'sensitivity': ['sensitive', 'allergic', 'reaction', 'sting']
        }
    
    def analyze_sentiment(self, text):
        """Get sentiment score (-1 to 1)"""
        scores = self.sia.polarity_scores(text)
        compound = scores['compound']
        
        if compound >= 0.05:
            sentiment = 'positive'
        elif compound <= -0.05:
            sentiment = 'negative'
        else:
            sentiment = 'neutral'
        
        return sentiment, compound
    
    def extract_issues(self, text):
        """Find mentioned issues"""
        text_lower = text.lower()
        detected = []
        
        for issue, keywords in self.issue_keywords.items():
            for keyword in keywords:
                if keyword in text_lower:
                    detected.append(issue)
                    break
        return detected
    
    def analyze_reviews(self, df):
        """Analyze all reviews"""
        results = []
        
        for _, row in df.iterrows():
            text = row.get('text', '')
            if not text or len(text) < 20:
                continue
            
            sentiment, score = self.analyze_sentiment(text)
            issues = self.extract_issues(text)
            
            results.append({
                'product_name': row.get('product_name', 'Unknown'),
                'rating': row.get('rating', 0),
                'sentiment': sentiment,
                'sentiment_score': score,
                'issues': issues,
            })
        
        return pd.DataFrame(results)
    
    def generate_report(self, df):
        """Create summary report"""
        report = {
            'total_reviews': len(df),
            'sentiment_counts': df['sentiment'].value_counts().to_dict(),
            'avg_sentiment_score': round(df['sentiment_score'].mean(), 3),
            'avg_rating': round(df['rating'].mean(), 1),
            'issue_frequency': {}
        }
        
        # Count issues
        all_issues = []
        for issues in df['issues']:
            all_issues.extend(issues)
        
        report['issue_frequency'] = dict(Counter(all_issues).most_common())
        
        return report

if __name__ == "__main__":
    analyzer = CosmeticSentimentAnalyzer()
    
    # Find latest review file
    review_files = glob.glob("data/reviews/amazon_reviews_*.csv")
    
    if review_files:
        latest = max(review_files, key=os.path.getctime)
        print(f"Loading: {latest}")
        
        df = pd.read_csv(latest)
        print(f"Reviews: {len(df)}")
        
        if len(df) > 0:
            results = analyzer.analyze_reviews(df)
            report = analyzer.generate_report(results)
            
            print("\n" + "="*50)
            print("SENTIMENT REPORT")
            print("="*50)
            print(f"Positive: {report['sentiment_counts'].get('positive', 0)}")
            print(f"Neutral:  {report['sentiment_counts'].get('neutral', 0)}")
            print(f"Negative: {report['sentiment_counts'].get('negative', 0)}")
            print(f"\nTop Issues:")
            for issue, count in list(report['issue_frequency'].items())[:3]:
                print(f"  - {issue}: {count}")
    else:
        print("No review files found")