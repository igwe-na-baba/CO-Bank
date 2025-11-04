import React, { useState, useMemo } from 'react';
import { CUSTOMER_REVIEWS, TOP_RATED_STAFF } from '../constants';
import { StarIcon, ChatBubbleOvalLeftEllipsisIcon } from './Icons';

const StarRating: React.FC<{ rating: number; className?: string }> = ({ rating, className = 'w-5 h-5' }) => (
    <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
            <StarIcon
                key={i}
                className={`${className} ${i < Math.floor(rating) ? 'text-yellow-400' : 'text-slate-300'}`}
            />
        ))}
    </div>
);

export const Ratings: React.FC = () => {
    const [name, setName] = useState('');
    const [comment, setComment] = useState('');
    const [rating, setRating] = useState(0);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name && comment && rating > 0) {
            setSubmitted(true);
        }
    };

    const overallSatisfaction = useMemo(() => {
        const totalRating = CUSTOMER_REVIEWS.reduce((sum, review) => sum + review.rating, 0);
        return (totalRating / CUSTOMER_REVIEWS.length).toFixed(1);
    }, []);

    return (
        <div className="space-y-12">
            <div className="text-center">
                <h2 className="text-4xl font-extrabold text-slate-800">Customer Satisfaction</h2>
                <p className="text-lg text-slate-500 mt-2 max-w-2xl mx-auto">We're proud of our service, but we're even prouder of what our customers have to say.</p>
            </div>

            {/* Overall Score */}
            <div className="bg-slate-200 rounded-2xl shadow-digital p-8 text-center">
                <p className="text-sm font-semibold text-slate-600 uppercase tracking-wider">Overall Satisfaction Score</p>
                <p className="text-7xl font-bold text-primary my-2">{overallSatisfaction}</p>
                <div className="flex justify-center">
                    <StarRating rating={Number(overallSatisfaction)} className="w-8 h-8" />
                </div>
                <p className="text-sm text-slate-500 mt-2">Based on {CUSTOMER_REVIEWS.length} reviews</p>
            </div>

            {/* Customer Reviews */}
            <div>
                <h3 className="text-2xl font-bold text-slate-800 mb-6">What Our Customers Are Saying</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {CUSTOMER_REVIEWS.map(review => (
                        <div key={review.id} className="bg-slate-200 rounded-2xl shadow-digital p-6">
                            <div className="flex items-center space-x-4 mb-4">
                                <div className="w-12 h-12 bg-primary/20 text-primary rounded-full flex items-center justify-center font-bold text-lg">
                                    {review.author.charAt(0)}
                                </div>
                                <div>
                                    <p className="font-bold text-slate-800">{review.author}</p>
                                    <p className="text-xs text-slate-500">{review.location}</p>
                                </div>
                            </div>
                            <StarRating rating={review.rating} />
                            <p className="text-sm text-slate-600 mt-3 italic">"{review.comment}"</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Top Rated Staff */}
            <div>
                <h3 className="text-2xl font-bold text-slate-800 mb-6">Meet Our Top-Rated Team</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {TOP_RATED_STAFF.map(staff => (
                        <div key={staff.id} className="bg-slate-200 rounded-2xl shadow-digital p-6 text-center">
                            <img src={staff.imageUrl} alt={staff.name} className="w-24 h-24 rounded-full mx-auto mb-4 shadow-lg object-cover" />
                            <h4 className="font-bold text-lg text-slate-800">{staff.name}</h4>
                            <p className="text-sm font-semibold text-primary">{staff.title}</p>
                            <div className="flex justify-center my-2">
                                <StarRating rating={staff.rating} />
                            </div>
                            <p className="text-xs text-slate-600 mt-2">{staff.bio}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Leave a Review */}
            <div className="bg-slate-200 rounded-2xl shadow-digital p-8">
                 <h3 className="text-2xl font-bold text-slate-800 mb-4 text-center">Leave Your Own Review</h3>
                 {submitted ? (
                     <div className="text-center py-8">
                         <h4 className="text-xl font-bold text-green-600">Thank you for your feedback!</h4>
                         <p className="text-slate-600 mt-2">We appreciate you taking the time to share your experience.</p>
                     </div>
                 ) : (
                    <form onSubmit={handleSubmit} className="max-w-xl mx-auto space-y-4">
                        <div className="flex justify-center space-x-2">
                            {[1, 2, 3, 4, 5].map(star => (
                                <button key={star} type="button" onClick={() => setRating(star)}>
                                    <StarIcon className={`w-8 h-8 transition-colors ${rating >= star ? 'text-yellow-400' : 'text-slate-300'}`} />
                                </button>
                            ))}
                        </div>
                        <div>
                            <label htmlFor="name" className="text-sm font-medium text-slate-700">Your Name</label>
                            <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} required className="mt-1 w-full p-2 rounded-md shadow-digital-inset" />
                        </div>
                        <div>
                            <label htmlFor="comment" className="text-sm font-medium text-slate-700">Your Comment</label>
                            <textarea id="comment" value={comment} onChange={e => setComment(e.target.value)} rows={4} required className="mt-1 w-full p-2 rounded-md shadow-digital-inset" />
                        </div>
                        <button type="submit" className="w-full py-3 text-white bg-primary rounded-lg font-semibold shadow-md">Submit Review</button>
                    </form>
                 )}
            </div>
        </div>
    );
};