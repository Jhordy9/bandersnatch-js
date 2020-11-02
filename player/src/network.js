const network = ({ host }) => {

  const parseManifestURL = ({ url, fileResolution, fileResolutionTag, hostTag }) => {
    const { replace } = R;

    const initialUrl = replace(fileResolutionTag, fileResolution, url);
    const finalUrl = replace(hostTag, host, initialUrl);

    return finalUrl;
  };

  const fetchFile = async (url) => {
    const response = await fetch(url);
    return response.arrayBuffer();
  };

  const getProperResolution = async (url) => {
    const startMs = Date.now();
    const response = await fetch(url);
    await response.arrayBuffer();
    const endMs = Date.now();

    const durationInMs = (endMs - startMs);

    const resolutions = [
      { start: 3001, end: 20000, resolution: 144 },
      { start: 901, end: 3000, resolution: 360 },
      { start: 0, end: 900, resolution: 720 }
    ];

    const item = resolutions.find(item => {
      return item.start <= durationInMs && item.end >= durationInMs;
    });

    const lowestResolution = 144;
    if (!item) return lowestResolution;

    return item.resolution;
  };

  return { parseManifestURL, fetchFile, getProperResolution };
};

