import APIService from './DataServise.js';
import template from '../templates/list-card.hbs';
import jsKillerTemplate from '../templates/jsKillerCard.hbs';
import jsKillerTeam from '../json/jsKillers.json';
// import refs from './refs';
import filmTpl from '../templates/modalFilmCard.hbs';
import refs from '../js/refs';

import listCardTpl from '../templates/list-card.hbs';
import DataSaver from './dataSaver.js';
import App from './appClass.js';
import Message from './message.js';

export default class DataMarkup {
  constructor() {
    this.messsage = new Message();
    this.dataSaver = new DataSaver();
    this.dataAPI = new APIService();
    this.listRef = refs.listUlFilms;

    this.refs = refs;
    this.filmTpl = filmTpl;
    this.listCardTpl = listCardTpl;
  }
  // Рисование списка карточек
  renderMarkup = data => {
    this.listRef.innerHTML = template(data);
  };

  // Отрисовка популярных
  renderPopularFilms = async () => {
    const dataPopular = await this.dataAPI.getPopularFilms();
    this.renderMarkup(dataPopular);
  };

  // Отрисовка по запросу
  getSearchingFilms = async query => {
    const currentQuerySeach = await this.dataAPI.getFilmsByQuery();
    this.renderMarkup(currentQuerySeach);
  };

  // Отрисовка очереди
  getCurrentFilmsWatched = async id => {
    const currentFilmsWatched = await this.dataSaver.getFilmWatched();
    this.renderMarkup(currentFilmsWatched);
  };
  //
  // Отрисовка просмотренных
  getCurrentFilmsQueue = async id => {
    const currentFilmsQueue = await this.dataSaver.getFilmQueue();
    this.renderMarkup(currentFilmsQueue);
  };

  // Отрисовка карточки фильма для модалки
  modalFilmMurcup = film => {
    // this.refs.modalRef.insertAdjacentHTML('beforeend', filmTpl(film));
    this.refs.modalCardRef.innerHTML = filmTpl(film);
  };
  // listener на список

  renderModalTeam = () => {
    try {
      const markup = jsKillerTemplate(jsKillerTeam);
      refs.modalContainer.innerHTML = markup;
    } catch (error) {
      console.error('Yes, babe, the error has been appeared here. Check your code. 🤷‍♂️');
    }
  };
  // Отрисовка карточки фильма для модалки

  modalFilmMurcup = film => {
    refs.modalContainer.innerHTML = '';
    // this.refs.modalRef.insertAdjacentHTML('beforeend', filmTpl(film));
    this.refs.modalCardRef.innerHTML = filmTpl(film);
  };
}
