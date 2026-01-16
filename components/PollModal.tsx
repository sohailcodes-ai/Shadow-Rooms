
import React, { useState } from 'react';
import { Poll } from '../types';
import GlassCard from './GlassCard';

interface PollModalProps {
  onCreatePoll: (pollData: Omit<Poll, 'id' | 'createdBy'>) => void;
  onClose: () => void;
}

const PollModal: React.FC<PollModalProps> = ({ onCreatePoll, onClose }) => {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const addOption = () => {
    if (options.length < 5) {
      setOptions([...options, '']);
    }
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index);
      setOptions(newOptions);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (question.trim() && options.every(opt => opt.trim())) {
      const pollOptions = options.map(opt => ({
        id: `opt_${Math.random().toString(36).substring(2, 9)}`,
        text: opt,
        votes: 0,
      }));
      onCreatePoll({ question, options: pollOptions });
    } else {
      alert('Please fill out the question and all option fields.');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <GlassCard className="w-full max-w-md relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl">&times;</button>
        <h2 className="text-2xl font-bold text-center mb-6">Create a New Poll</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Poll Question</label>
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="w-full px-3 py-2 bg-black/30 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-400"
              placeholder="What's on your mind?"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Options</label>
            <div className="space-y-2">
              {options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    className="w-full px-3 py-2 bg-black/30 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-400"
                    placeholder={`Option ${index + 1}`}
                  />
                  {options.length > 2 && (
                    <button type="button" onClick={() => removeOption(index)} className="p-2 text-red-400 hover:bg-red-500/10 rounded-full">
                      &ndash;
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
          {options.length < 5 && (
            <button type="button" onClick={addOption} className="w-full text-sm py-2 bg-white/5 hover:bg-white/10 rounded-md">
              + Add Option
            </button>
          )}
          <button
            type="submit"
            className="w-full py-3 mt-4 font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded-md transition-colors duration-300"
          >
            Launch Poll
          </button>
        </form>
      </GlassCard>
    </div>
  );
};

export default PollModal;
