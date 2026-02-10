"""
Sentiment analysis for product reviews
"""
import nltk
from nltk.sentiment import SentimentIntensityAnalyzer

class SentimentAnalyzer:
    def __init__(self):
        self.sia = SentimentIntensityAnalyzer()
    
    def analyze(self, text):
        """Analyze sentiment of text"""
        scores = self.sia.polarity_scores(text)
        return scores
