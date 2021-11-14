import AuthForm from './authForm';
import DataMarkup from './dataMarkup';
import DataSaver from './dataSaver';
import LoadSpinner from './loadSpinner';
import Message from './message.js';
import refs from './refs.js';

export default class Modal {
  constructor() {
    this.refs = refs;
    this.dataSaver = new DataSaver();
    this.load = new LoadSpinner();
    this.dataMarkup = new DataMarkup();
  }

  onOpenModal = (id, page, trailer) => {
    this.page = page;
    if (id) {
      this.id = id;
      this.trailer = trailer;
      this.getRefs();
    }

    this.refs.btnClose.addEventListener('click', this.onBtnClosePress);
    this.refs.backdrop.addEventListener('click', this.onBackdropClick);
    this.refs.backdrop.classList.remove('visually-hidden');
    window.addEventListener('keydown', this.onEscKeyPress);
    this.refs.buttonGetVideos.addEventListener('click', this.onBtnTrailerPress);

    if (page === 'film') {
      if (sessionStorage.getItem('user') === null) {
        this.getRefs();
        this.refs.itemAddWatched.classList.add('hidden');
        this.refs.itemRemoveWatched.classList.add('hidden');
        this.refs.itemAddQueue.classList.add('hidden');
        this.refs.itemRemoveQueue.classList.add('hidden');
      } else {
        this.checkQueue(id);
        this.checkWatched(id);
        this.addBtnListeners();
      }
    }
  };

  onCloseModal = () => {
    this.refs.btnClose.removeEventListener('click', this.onBtnClosePress);
    this.refs.backdrop.removeEventListener('click', this.onBackdropClick);
    this.refs.backdrop.classList.add('visually-hidden');
    window.removeEventListener('keydown', this.onEscKeyPress);
    if (this.page === 'film') {
      this.removeBtnListeners();
    }
    if (this.modalAuth) {
      this.modalAuth.removeListeners();
      this.modalAuth = null;
    }
    this.refs.modalCardRef.innerHTML = '';
    // team
    this.refs.modalContainer.innerHTML = '';

    this.refs.buttonGetVideos.removeEventListener('click', this.onBtnTrailerPress);
    this.refs.trailerContainer.innerHTML = '';
  };

  onBtnClosePress = () => {
    this.onCloseModal();
  };

  onBackdropClick = event => {
    if (event.currentTarget === event.target) {
      this.onCloseModal();
    }
  };

  // onOpenModalTeam = () => {
  //   console.log('Open modal team');
  // };

  onEscKeyPress = event => {
    const ESC_KEY_CODE = 'Escape';

    if (event.code === ESC_KEY_CODE) {
      this.onCloseModal();
    }
  };

  getRefs = () => {
    this.refs.itemAddWatched = document.querySelector('.js-add-watched');
    this.refs.itemRemoveWatched = document.querySelector('.js-remove-watched');
    this.refs.itemAddQueue = document.querySelector('.js-add-queue');
    this.refs.itemRemoveQueue = document.querySelector('.js-remove-queue');
    this.refs.buttonGetVideos = document.querySelector('.js-add-video');
    this.refs.trailerContainer = document.querySelector('.js-video-trailer');
  };

  addBtnListeners = () => {
    // this.getRefs();
    this.refs.itemAddWatched.addEventListener('click', this.onBtnAddWatchedPress);
    this.refs.itemRemoveWatched.addEventListener('click', this.onBtnRemoveWatchedPress);
    this.refs.itemAddQueue.addEventListener('click', this.onBtnAddQueuePress);
    this.refs.itemRemoveQueue.addEventListener('click', this.onBtnRemoveQueuePress);
  };

  removeBtnListeners = () => {
    // this.getRefs();
    this.refs.itemAddWatched.removeEventListener('click', this.onBtnAddWatchedPress);
    this.refs.itemRemoveWatched.removeEventListener('click', this.onBtnRemoveWatchedPress);
    this.refs.itemAddQueue.removeEventListener('click', this.onBtnAddQueuePress);
    this.refs.itemRemoveQueue.removeEventListener('click', this.onBtnRemoveQueuePress);
  };

  onBtnAddWatchedPress = async event => {
    try {
      this.load.showSpinner();
      const res = await this.dataSaver.addFilm(this.id, 'watched');
      this.refs.itemAddWatched.classList.add('hidden');
      this.refs.itemRemoveWatched.classList.remove('hidden');
      this.reRenderPage();
    } catch (error) {
      Message.error(error.message);
    } finally {
      this.load.hideSpinner();
    }
  };

  onBtnRemoveWatchedPress = async () => {
    try {
      this.load.showSpinner();
      const res = await this.dataSaver.removeData(this.id, 'watched');
      this.refs.itemAddWatched.classList.remove('hidden');
      this.refs.itemRemoveWatched.classList.add('hidden');
      this.reRenderPage();
    } catch (error) {
      Message.error(error.message);
    } finally {
      this.load.hideSpinner();
    }
  };

  onBtnAddQueuePress = async () => {
    try {
      this.load.showSpinner();
      const res = await this.dataSaver.addFilm(this.id, 'queue');
      this.refs.itemAddQueue.classList.add('hidden');
      this.refs.itemRemoveQueue.classList.remove('hidden');
      this.reRenderPage();
    } catch (error) {
      Message.error(error);
    } finally {
      this.load.hideSpinner();
    }
  };

  onBtnRemoveQueuePress = async () => {
    console.log('itemRemoveQueue');
    try {
      const res = await this.dataSaver.removeData(this.id, 'queue');
      this.refs.itemAddQueue.classList.remove('hidden');
      this.refs.itemRemoveQueue.classList.add('hidden');
      this.reRenderPage();
    } catch (error) {
      Message.error(error);
    } finally {
      this.load.hideSpinner();
    }
  };

  reRenderPage = async () => {
    const page = this.dataSaver.getActivePage();
    this.checkQueue(this.id);
    this.checkWatched(this.id);
    switch (page) {
      case 'watched':
        this.dataMarkup.getCurrentFilmsWatched();
        await this.dataSaver.setTotalPageFilms('watched');
        break;
      case 'queue':
        this.dataMarkup.getCurrentFilmsQueue();
        await this.dataSaver.setTotalPageFilms('queue');
        break;
    }
  };

  checkWatched = async id => {
    const filmInList = await this.dataSaver.isFilmInList(id, 'watched');
    if (filmInList) {
      this.refs.itemAddWatched.classList.add('hidden');
      this.refs.itemRemoveWatched.classList.remove('hidden');
    } else {
      this.refs.itemAddWatched.classList.remove('hidden');
      this.refs.itemRemoveWatched.classList.add('hidden');
    }
  };

  checkQueue = async id => {
    const filmInList = await this.dataSaver.isFilmInList(id, 'queue');
    if (filmInList) {
      this.refs.itemAddQueue.classList.add('hidden');
      this.refs.itemRemoveQueue.classList.remove('hidden');
    } else {
      this.refs.itemAddQueue.classList.remove('hidden');
      this.refs.itemRemoveQueue.classList.add('hidden');
    }
  };

  checkVideo = async id => {};

  addAuth = callback => {
    this.modalAuth = new AuthForm(callback, this.onCloseModal);
    this.modalAuth.renderModalAuth();
  };

  onBtnTrailerPress = () => {
    // this.fetchFilmVideos(this.id);
    console.log('Trailer ' + this.trailer.key);
    this.refs.trailerContainer.innerHTML = `
      <iframe width="560" height="315" src='https://www.youtube.com/embed/${this.trailer.key}'frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
    `;
  };
}
