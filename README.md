# Jira Story Completeness Analyzer

This project contains a Forge app written in JavaScript that analyzes Jira user stories for completeness. The app displays a completeness score and checklist showing which sections are present in the story description. 

See [developer.atlassian.com/platform/forge/](https://developer.atlassian.com/platform/forge) for documentation and tutorials explaining Forge.

## Requirements

See [Set up Forge](https://developer.atlassian.com/platform/forge/set-up-forge/) for instructions to get set up.

## Features

The app analyzes Jira user stories and checks for:
- **User Story Format**: Requires all three keywords (Given, When, Then) to be present
- **Acceptance Criteria**: Checks for acceptance criteria, AC, or requirements
- **Test Cases**: Checks for test cases, testing, or scenarios
- **Dependencies / Assumptions**: Checks for dependency, dependencies, assumption, or assumptions

The app displays a completeness score (X/4) and a visual progress bar that changes based on completion:

## Quick start

- Modify your app frontend by editing the `src/index.jsx` file.

- Modify your app backend by editing the `src/resolver.js` file to define resolver functions. See [Forge resolvers](https://developer.atlassian.com/platform/forge/runtime-reference/custom-ui-resolver/) for documentation on resolver functions.

- Build and deploy your app by running:
```
forge deploy
```

- Install your app in an Atlassian site by running:
```
forge install
```

- Develop your app by running `forge tunnel` to proxy invocations locally:
```
forge tunnel
```

### Notes
- Use the `forge deploy` command when you want to persist code changes.
- Use the `forge install` command when you want to install the app on a new site.
- Once the app is installed on a site, the site picks up the new app changes you deploy without needing to rerun the install command.

## Support

See [Get help](https://developer.atlassian.com/platform/forge/get-help/) for how to get help and provide feedback.
