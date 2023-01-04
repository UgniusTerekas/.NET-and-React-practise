import { PaginatedResponse } from "./../models/pagination";
import axios, { AxiosError, AxiosResponse } from "axios";

axios.defaults.baseURL = "http://localhost:5041/api/";
axios.defaults.withCredentials = true;

const sleep = () => new Promise((resolve) => setTimeout(resolve, 1000));
const responseBody = (response: AxiosResponse) => response.data;

axios.interceptors.response.use(async (response) => {
  await sleep();
  const pagination = response.headers["pagination"];
  if (pagination) {
    response.data = new PaginatedResponse(
      response.data,
      JSON.parse(pagination)
    );
    console.log(response);
    return response;
  }
  console.log(response);
  return response;
});

const requests = {
  get: (url: string, params?: URLSearchParams) =>
    axios.get(url, { params }).then(responseBody),
  post: (url: string, body: {}) => axios.post(url, body).then(responseBody),
  put: (url: string, body: {}) => axios.put(url, body).then(responseBody),
  delete: (url: string) => axios.delete(url).then(responseBody),
};

const Catalog = {
  list: (params: URLSearchParams) => requests.get("products", params),
  details: (id: number) => requests.get(`products/${id}`),
  fetchFilters: () => requests.get("products/filters"),
};

const Basket = {
  get: () => requests.get("basket"),
  addItem: (productId: number, quantity = 1) =>
    requests.post(`basket?productId=${productId}&quantity=${quantity}`, {}),
  removeItem: (productId: number, quantity = 1) =>
    requests.delete(`basket?productId=${productId}&quantity=${quantity}`),
};

const agent = {
  Catalog,
  Basket,
};

export default agent;