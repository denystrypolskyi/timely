import ClipLoader from "react-spinners/ClipLoader";

const LoadingSpinner = () => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <ClipLoader size={20} color="#fff" />
    </div>
  );
};

export default LoadingSpinner;
