import React, { useEffect, useState, useRef, useMemo } from 'react';
import ForgeReconciler, { Text, Heading, Box, Lozenge, useProductContext, ProgressBar } from '@forge/react';
import { invoke } from '@forge/bridge';

const App = () => {
  const context = useProductContext();
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const lastFetchedIssueId = useRef(null);

  // Extract issue ID from context - try multiple paths to find the issue ID
  const issueId = useMemo(() => {
    return context?.extension?.issue?.id || 
           context?.issue?.id || 
           context?.extension?.issueKey ||
           null;
  }, [context?.extension?.issue?.id, context?.issue?.id, context?.extension?.issueKey]); // Depend on all possible paths

  useEffect(() => {
    // Only fetch if we have an issue ID and haven't already fetched for this issue
    if (issueId && lastFetchedIssueId.current !== issueId) {
      lastFetchedIssueId.current = issueId;
      setLoading(true);
      setError(null);
      invoke('analyzeStory', { issueId })
        .then(result => {
          setAnalysis(result);
          setLoading(false);
        })
        .catch(err => {
          setError(err.message || 'Failed to analyze story');
          setLoading(false);
        });
    } else if (!issueId) {
      // If no issueId, ensure we're not in a loading state
      setLoading(false);
    }
  }, [issueId]); // Only depend on issueId, not the entire context object

  if (error) return <Text>Error: {error}</Text>;
  // Only show loading if we're actively loading AND don't have analysis yet, or if we don't have an issueId yet
  if ((loading && !analysis) || (!issueId && !analysis)) {
    return <Text>Analyzing requirements...</Text>;
  }
  // If we don't have analysis but have an issueId and aren't loading, something went wrong
  if (!analysis) {
    return <Text>Unable to analyze story</Text>;
  }

  const { completedCount, totalCount } = analysis;
  const progressValue = completedCount / totalCount; // Value between 0 and 1 for ProgressBar
  const progressPercent = (completedCount / totalCount) * 100; // Percentage for progress bar
  
  // Determine progress bar color based on completion count
  const getProgressColor = () => {
    switch (completedCount) {
      case 0:
        return '#E5E7EB'; // Gray
      case 1:
        return '#FBBF24'; // Soft amber
      case 2:
        return '#F59E0B'; // Warm amber
      case 3:
        return '#84CC16'; // Lime-green
      case 4:
        return '#16A34A'; // Green
      default:
        return '#E5E7EB'; // Gray fallback
    }
  };

  const willRenderProgressBar = ProgressBar !== undefined && ProgressBar !== null;

  return (
    <Box>
      <Heading size="medium">{completedCount}/{totalCount} user story sections completed</Heading>
      <Box paddingBlock="space.100">
        {/* Official ProgressBar component */}
        {willRenderProgressBar ? (
          <ProgressBar value={progressValue} ariaLabel={`${completedCount} out of ${totalCount} sections completed`} />
        ) : (
          /* Fallback to custom Box-based progress bar */
          <Box
            backgroundColor="color.background.neutral"
            borderRadius="radius.100"
            padding="space.0"
            overflow="hidden"
            style={{ height: '12px', width: '100%' }}
          >
            <Box
              style={{ 
                height: '100%', 
                width: `${progressPercent}%`,
                backgroundColor: getProgressColor(),
                transition: 'width 0.3s ease, background-color 0.3s ease'
              }}
            />
          </Box>
        )}
      </Box>
      <Box paddingBlock="space.200">
        <Text>{analysis.checks.userStory ? '✅' : '❌'} User Story Format</Text>
        <Text>{analysis.checks.acceptanceCriteria ? '✅' : '❌'} Acceptance Criteria</Text>
        <Text>{analysis.checks.testCases ? '✅' : '❌'} Test Cases</Text>
        <Text>{analysis.checks.dependenciesAssumptions ? '✅' : '❌'} Dependencies / Assumptions</Text>
      </Box>
    </Box>
  );
};

// ForgeReconciler is the default export - it's an object with a render method
if (ForgeReconciler && ForgeReconciler.render) {
  ForgeReconciler.render(<App />);
} else {
  console.error('ForgeReconciler.render is not available');
}