import React from 'react';
import { ReviewHub } from './review/ReviewHub';

// /missed renders the review hub with the Missed tab selected.
export const Missed: React.FC = () => <ReviewHub initialTab="missed" />;
