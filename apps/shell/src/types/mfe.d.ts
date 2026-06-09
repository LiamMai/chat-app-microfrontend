declare module 'mfe_chat/Module' {
  interface ChatAppProps {
    /** Current user the shell already fetched, so the MFE skips its own /me. */
    currentUser?: {
      id: string;
      firstName: string;
      lastName: string | null;
      username: string | null;
      avatarUrl: string | null;
      email: string;
    } | null;
  }
  interface ChatAppPropsWithEmbed extends ChatAppProps {
    /** Marks the MFE as embedded so it skips its own /me fetch. */
    embedded?: boolean;
  }
  const ChatApp: React.ComponentType<ChatAppPropsWithEmbed>;
  export default ChatApp;
}
