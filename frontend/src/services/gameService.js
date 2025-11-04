import axios from "axios";
const baseUrl = '/api/game';

const createGame = async () => {
  const response = await axios.post(baseUrl);
  return response.data;
};

const getGameState = async (gameId) => {
  const response = await axios.get(`${baseUrl}/${gameId}`);
  return response.data;
};

const makeMove = async (gameId, from, to) => {
  const response = await axios.post(`${baseUrl}/${gameId}/move`, { from, to });
  return response.data;
};

const getLegalMoves = async (gameId, row, col) => {
  const response = await axios.get(`${baseUrl}/${gameId}/moves/${row}/${col}`);
  return response.data;
};

const promotePawn = async (gameId, at, promoteToType) => {
  const response = await axios.post(`${baseUrl}/${gameId}/promote`, { at, promoteToType });
  return response.data;
}

export default {
  createGame,
  getGameState,
  makeMove,
  getLegalMoves,
  promotePawn
};
