import React from 'react';
import { ReviewHub } from './review/ReviewHub';

// /review renders the review hub with the Bookmarks tab selected.
export const ReviewPage: React.FC = () => <ReviewHub initialTab="bookmarks" />;
