

const main = async () => {
  const MANIFEST_URL = 'manifest.json';
  const localHost = ['127.0.0.1', 'localhost'];

  const isLocal = !!R.indexOf(~localHost, window.location.hostname);
  const manifestJSON = await (await fetch(MANIFEST_URL)).json();
  const host = isLocal ? manifestJSON.localHost : manifestJSON.productionHost;

  const isNetwork = network({ host });
  const playerComponent = videoComponent();
  const player = videoMediaPlayer({ manifestJSON, isNetwork, playerComponent });

  player.initializeCodec();
  playerComponent.initializePlayer();

  window.nextChunk = (data) => player.nextChunk(data);
}

window.onload = main();