import React from 'react';

const CategoryBadge = ({ category }) => {
  const styles = {
    Food: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    Transport: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    Shopping: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
    Medical: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    Education: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    Entertainment: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    Bills: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
    Travel: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    Other: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  };

  const currentStyle = styles[category] || styles.Other;

  return (
    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${currentStyle}`}>
      {category}
    </span>
  );
};

export default CategoryBadge;
