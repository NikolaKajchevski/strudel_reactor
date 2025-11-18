// Preprocessing logic for volume control
export const preprocessVolume = (inputText, volume) => {
  // Convert volume from 0-100 range to 0-2 multiplier
  const volumeMultiplier = volume / 50;
  
  const instrumentRegex = /([a-zA-Z_][a-zA-Z0-9_]*):[\s\S]*?(?=\n[a-zA-Z_][a-zA-Z0-9_]*:|\n\/\/|$)/g;
  
  let matches = [];
  let match;
  
  while ((match = instrumentRegex.exec(inputText)) !== null) {
    matches.push({
      fullMatch: match[0],
      index: match.index
    });
  }
  
  const gainRegex = /(?<!post)gain\(([0-9.]+)\)/g;
  
  // Process each match
  const processedMatches = matches.map(matchObj => {
    let processed = matchObj.fullMatch;
    
    processed = processed.replace(gainRegex, (fullMatch, capturedValue) => {
      return `gain(${capturedValue} * ${volumeMultiplier})`;
    });
    
    return {
      ...matchObj,
      processed
    };
  });
  
  let lastIndex = 0;
  const result = processedMatches.reduce((acc, item, i) => {
    const before = inputText.substring(lastIndex, item.index);
    lastIndex = item.index + item.fullMatch.length;
    
    return acc + before + item.processed;
  }, '');
  
  const remaining = inputText.substring(lastIndex);
  
  return result + remaining;
};