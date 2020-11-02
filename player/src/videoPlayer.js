const videoMediaPlayer = ({ manifestJSON, isNetwork, playerComponent }) => {
  const { toLower, indexOf } = R;

  let videoElement = null;
  let videoDuration = 0;
  let sourceBuffer = null;
  let selected = {};
  let activeItem = {};
  let selections = [];



  const currentFileResolution = async () => {
    const lowestResolution = 144;
    const prepareUrl = {
      url: manifestJSON.finalizar.url,
      fileResolution: lowestResolution,
      fileResolutionTag: manifestJSON.fileResolutionTag,
      hostTag: manifestJSON.hostTag,
    };

    const url = isNetwork.parseManifestURL(prepareUrl);
    return isNetwork.getProperResolution(url);
  };

  const waitForQuestions = () => {
    const currentTime = parseInt(videoElement.currentTime);

    const option = selected.at === currentTime;
    if (!option) return;

    if (activeItem.url === selected.url) return;
    playerComponent.configureModal(selected.options);
    activeItem = selected;
  };

  const sourceOpenWrapper = (mSource) => {
    return async (_) => {
      sourceBuffer = mSource.addSourceBuffer(manifestJSON.codec);
      selected = manifestJSON.intro

      mSource.duration = videoDuration;
      await fileDonwload(selected.url);
      setInterval(() => waitForQuestions(), 200);
    };
  };

  const initializeCodec = () => {
    videoElement = document.getElementById('vid');
    const mediaSourceSupported = !!window.MediaSource;

    if (!mediaSourceSupported) {
      alert('Seu browser ou sistema não tem suporte a MSE!');
      return;
    }

    const codedSuported = MediaSource.isTypeSupported(manifestJSON.codec);

    if (!codedSuported) {
      alert(`Seu browser não suporta o codec: ${manifestJSON.codec}`);
    }

    const mSource = new MediaSource();
    videoElement.src = URL.createObjectURL(mSource);
    mSource.addEventListener("sourceopen", sourceOpenWrapper(mSource))
  }

  const setVideoPlayerDuration = (finalUrl) => {
    const bars = finalUrl.split('/');
    const [name, duration] = bars[bars.length - 1].split('-');
    videoDuration += parseFloat(duration);
  };

  const processBufferSegments = async (allSegments) => {
    sourceBuffer.appendBuffer(allSegments);

    return new Promise((resolve, reject) => {
      const updateEnd = (_) => {
        sourceBuffer.removeEventListener('updateend', updateEnd);
        sourceBuffer.timestampOffset = videoDuration;

        return resolve();
      };

      sourceBuffer.addEventListener('updateend', updateEnd);
      sourceBuffer.addEventListener('error', reject);

    });
  };

  const manageLag = (selected) => {
    if (!!~indexOf(selected.url, selections)) {
      selected.at += 5;
      return;
    };

    selections.push(selected.url);
  };

  const nextChunk = async (data) => {
    const key = toLower(data);
    const isSelected = manifestJSON[key];


    selected = {
      ...isSelected,
      at: parseInt(videoElement.currentTime + isSelected.at)
    };


    manageLag(selected.url);
    videoElement.play();
    await fileDonwload(isSelected.url);
  };

  const fileDonwload = async (url) => {
    const fileResolution = await currentFileResolution();
    const prepareUrl = {
      url,
      fileResolution,
      fileResolutionTag: manifestJSON.fileResolutionTag,
      hostTag: manifestJSON.hostTag,
    };

    const finalUrl = isNetwork.parseManifestURL(prepareUrl);
    setVideoPlayerDuration(finalUrl);

    const data = await isNetwork.fetchFile(finalUrl);
    processBufferSegments(data);
  };

  return { nextChunk, initializeCodec }
}
