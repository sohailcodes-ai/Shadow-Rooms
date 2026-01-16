
import React from 'react';
import { Poll, PollOption } from '../types';
import GlassCard from './GlassCard';

interface PollViewProps {
  poll: Poll;
  onVote: (optionId: string) => void;
}

const PollOptionView: React.FC<{ option: PollOption; totalVotes: number; onVote: (optionId: string) => void }> = ({ option, totalVotes, onVote }) => {
    const percentage = totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0;
    
    return (
        <button 
            onClick={() => onVote(option.id)}
            className="w-full text-left p-3 my-1 bg-white/5 rounded-lg relative overflow-hidden group"
        >
            <div 
                className="absolute top-0 left-0 h-full bg-cyan-500/30 transition-all duration-500 ease-out"
                style={{ width: `${percentage}%` }}
            ></div>
            <div className="relative flex justify-between items-center">
                <span className="font-medium text-gray-200">{option.text}</span>
                <div className="flex items-center space-x-2">
                    <span className="text-sm font-semibold text-cyan-300">{Math.round(percentage)}%</span>
                    <span className="text-xs text-gray-400">({option.votes})</span>
                </div>
            </div>
        </button>
    );
};


const PollView: React.FC<PollViewProps> = ({ poll, onVote }) => {
  const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes, 0);

  return (
    <GlassCard className="my-4 border border-cyan-500/30">
        <h3 className="font-bold text-lg text-white mb-2">{poll.question}</h3>
        <div className="flex flex-col">
            {poll.options.map(option => (
                <PollOptionView 
                    key={option.id}
                    option={option}
                    totalVotes={totalVotes}
                    onVote={onVote}
                />
            ))}
        </div>
        <p className="text-right text-xs text-gray-500 mt-2">{totalVotes} Total Votes</p>
    </GlassCard>
  );
};

export default PollView;
