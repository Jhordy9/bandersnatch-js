const videoComponent = () => {
  let modal = {};

  const initializePlayer = () => {
    const player = videojs('vid');
    const ModalDialog = videojs.getComponent('ModalDialog');
    const isModal = new ModalDialog(player, {
      temporary: false,
      closeable: true
    });

    player.addChild(isModal);

    player.on('play', () => isModal.close());

    modal = isModal;
  }

  const getModalTemplate = (options, modal) => {

    return (_) => {
      const [op1, op2] = options;
      const htmlTemplate = `
        <div class="overlay">
          <div class="videoButtonWrapper">
            <button class="btn btn-dark" onClick="window.nextChunk('${op1}')">
            ${op1}
            </button>
            <button class="btn btn-dark" onClick="window.nextChunk('${op2}')">
            ${op2}
            </button>
          </div>
        </div>
      `

      modal.contentEl().innerHTML = htmlTemplate;
    };
  };

  const configureModal = (selected) => {
    modal.on('modalopen', getModalTemplate(selected, modal))
    modal.open();
  };

  return { configureModal, initializePlayer };
}