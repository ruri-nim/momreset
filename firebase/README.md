## Daily OK Firebase Structure

This app stores signed-in user data in Cloud Firestore with this shape:

```text
users/{email}
users/{email}/profile/main
users/{email}/foodLogs/{foodLogId}
users/{email}/exerciseLogs/{exerciseLogId}
users/{email}/ruleTemplates/{ruleId}
users/{email}/ruleLogs/{dateKey}
users/{email}/weightLogs/{weightLogId}
users/{email}/weeklyFeedback/{weekKey}
users/{email}/widgetSummary/{dateKey}
```

### Required server env

```bash
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
```

The app currently uses Google login through NextAuth and writes to Firestore on the server.
