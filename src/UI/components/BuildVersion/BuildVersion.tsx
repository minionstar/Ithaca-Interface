type BuildVersion = {
  className?: string;
};

function BuildVersion({ className }: Readonly<BuildVersion>) {
  const version = process.env.NEXT_PUBLIC_BUILD_ID;

  if (!version) return null;

  return <span className={className}>Version: {version}</span>;
}

export default BuildVersion;
