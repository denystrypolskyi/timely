const AuthCheckError = ({ retry }: { retry: () => void }) => (
  <div role="alert">
    Unable to check your session. <button onClick={retry}>Try again</button>
  </div>
);

export default AuthCheckError;
