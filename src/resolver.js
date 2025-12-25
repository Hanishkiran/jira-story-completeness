import Resolver from '@forge/resolver';
import api, { route } from '@forge/api';

const resolver = new Resolver();

resolver.define('analyzeStory', async ({ payload, context }) => {
  // Try to get issue ID from payload first, then from context
  let { issueId } = payload || {};
  
  // If not in payload, try to extract from context (common in issue panels)
  if (!issueId) {
    issueId = context?.extension?.issue?.id || context?.issue?.id || context?.extension?.issueKey;
  }
  
  if (!issueId) {
    throw new Error('Unable to get issue ID');
  }
  
  // Fetching data as the App (backend)
  const response = await api.asApp().requestJira(route`/rest/api/3/issue/${issueId}`);
  const data = await response.json();
  
  const rawDesc = data.fields.description;
  let fullText = "";
  
  if (rawDesc && rawDesc.content) {
    fullText = rawDesc.content.map(block => 
      block.content ? block.content.map(inline => inline.text).join('') : ''
    ).join(' ');
  }

  // Check for user story format - requires all three keywords: Given, When, and Then
  const hasGiven = /given/i.test(fullText);
  const hasWhen = /when/i.test(fullText);
  const hasThen = /then/i.test(fullText);
  const userStoryComplete = hasGiven && hasWhen && hasThen;

  const checks = {
    userStory: userStoryComplete,
    acceptanceCriteria: /acceptance criteria|ac:|requirements/i.test(fullText),
    testCases: /test case|testing|scenarios/i.test(fullText),
    dependenciesAssumptions: /(dependency|dependencies|assumption|assumptions)/i.test(fullText)
  };

  // Count how many metrics are completed (out of 4)
  let completedCount = 0;
  if (checks.userStory) completedCount++;
  if (checks.acceptanceCriteria) completedCount++;
  if (checks.testCases) completedCount++;
  if (checks.dependenciesAssumptions) completedCount++;

  return { completedCount, totalCount: 4, checks };
});

export const handler = resolver.getDefinitions();