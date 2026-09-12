import ConnectedWorkspace from '@/components/leadrescue/connected-workspace';
import {getChatGPTUser,chatGPTSignInPath,chatGPTSignOutPath} from './chatgpt-auth';

export const dynamic='force-dynamic';
export default async function Home() {
  const user=await getChatGPTUser();
  return <ConnectedWorkspace signedIn={!!user} displayName={user?.displayName??''}
    signInPath={chatGPTSignInPath('/')} signOutPath={chatGPTSignOutPath('/')} />;
}
