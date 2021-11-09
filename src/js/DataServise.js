import DataSaver from './dataSaver.js';
export default class APIService {
  constructor() {
    this.keyAPI = 'api_key=a907caf8c46067564d1786718be1cb84';
    this.baseUrl = 'https://api.themoviedb.org/3/';
    this.page = 10;
    this.url = '';
    this.query = '';
    this.dataSaver = new DataSaver();
  }

  fetchData = async url => {
    const response = await fetch(url);
    return response.json();
  };

  getPopularFilms = async () => {
    let popularFilms = 'trending/movie/week?';
    this.url = this.baseUrl + popularFilms + this.keyAPI + `&page=${this.page}`;
    const dataObj = await this.fetchData(this.url);
    const dataPopular = dataObj.results;
    let totalPages = dataObj.total_pages;
    this.dataSaver.setTotalPages(totalPages);
    const genreIds = dataPopular.map(film => film.genre_ids);
    await this.decodeGenres(genreIds);
    this.fixImagePath(dataPopular);
    dataPopular.map(film => (film.genre_ids = film.genre_ids.slice(0, 3)));
    this.dataSaver.setPopularFilms(dataPopular);
    this.dataSaver.setCurrentPage(this.page);
    console.log(dataPopular);
    return dataPopular;
  };

  decodeGenres = async genreIds => {
    let genres = this.dataSaver.getFilmsGenres();
    console.log(genres);
    if (genres === null) {
      genres = await this.fetchFilmsGenres();      
    }
    const genreNames = genreIds.map(array => {
      for (let i = 0; i < array.length; i += 1) {
        genres.map(obj => (array[i] === obj.id ? (array[i] = obj.name) : array[i]));
      }
      if (array.length > 3) {
        array.splice(2, 0, 'other');
      }
      return array;
    });
    return genreNames;
  };

  getFilmsByQuery = async query => {
    let queryEndpoint = `search/movie?query=${query}&`;
    this.url = this.baseUrl + queryEndpoint + this.keyAPI + `&page=${this.page}`;
    const queryFilmsResult = await this.fetchData(this.url);
    return queryFilmsResult.results;
  };

  fetchFilmsGenres = async () => {
    let genresEndpoint = 'genre/movie/list?';
    this.url = this.baseUrl + genresEndpoint + this.keyAPI;
    const result = await this.fetchData(this.url);
    this.dataSaver.setFilmsGenres(result);
    return result.genres;
  };

  fixImagePath = obj => {
    obj.map(film => (film.poster_path = 'https://image.tmdb.org/t/p/w500' + film.poster_path));
  };
}
