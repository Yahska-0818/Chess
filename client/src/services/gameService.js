import axios from "axios";
const baseUrl = "/api/game";

const createGame = async () => {
  const { data } = await axios.post(baseUrl);
  return data;
};

const getGameState = async (gameId) => {
  const { data } = await axios.get(`${baseUrl}/${gameId}`);
  return data;
};

const makeMove = async (gameId, from, to, roomCode, playerColor) => {
  const { data } = await axios.post(`${baseUrl}/${gameId}/move`, {
    from, to, roomCode, playerColor
  });
  return data;
};

const getLegalMoves = async (gameId, row, col) => {
  const { data } = await axios.get(`${baseUrl}/${gameId}/moves/${row}/${col}`);
  return data;
};

const promotePawn = async (gameId, from, to, promoteToType, roomCode, playerColor) => {
  const { data } = await axios.post(`${baseUrl}/${gameId}/promote`, {
    from, to, promoteToType, roomCode, playerColor
  });
  return data;
};

export default {
  createGame,
  getGameState,
  makeMove,
  getLegalMoves,
  promotePawn,
};
