import { Amplify } from 'aws-amplify';
import { fetchAuthSession, signOut, getCurrentUser } from 'aws-amplify/auth';

// Initialize Amplify with your Cognito configuration
// These values will be replaced with actual values from your deployed stack
export function configureAmplify() {
  Amplify.configure({
    Auth: {
      Cognito: {
        region: import.meta.env.AWS_REGION || 'us-east-1',
        userPoolId: import.meta.env.USER_POOL_ID,
        userPoolClientId: import.meta.env.USER_POOL_CLIENT_ID,
        // Remove OAuth configuration since we're using custom auth
        signUpVerificationMethod: 'code',
        userAttributes: {
          email: {
            required: true
          },
          name: {
            required: true
          },
          'custom:linkedinurl': {
            required: false
          },
          'custom:githuburl': {
            required: false
          }
        }
      }
    }
  });
}

// Authentication helper functions
export const AuthService = {
  // Sign in with custom form (no longer using hosted UI)
  signIn: async (email: string, password: string) => {
    try {
      const { signIn } = await import('aws-amplify/auth');
      const result = await signIn({
        username: email,
        password: password
      });
      return result;
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  },

  // Sign out
  signOut: async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  },

  // Check if user is authenticated
  isAuthenticated: async () => {
    try {
      const session = await fetchAuthSession();
      return session.tokens !== undefined;
    } catch (error) {
      return false;
    }
  },

  // Get current user
  getCurrentUser: async () => {
    try {
      const user = await getCurrentUser();
      // Get user attributes from the session
      const session = await fetchAuthSession();
      const userAttributes = session.tokens?.idToken?.payload || {};
      
      // Combine user info with attributes
      return {
        ...user,
        attributes: userAttributes
      };
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },

  // Get current user's JWT token
  getJwtToken: async () => {
    try {
      const session = await fetchAuthSession();
      return session.tokens?.idToken?.toString();
    } catch (error) {
      console.error('Error getting JWT token:', error);
      return null;
    }
  }
};