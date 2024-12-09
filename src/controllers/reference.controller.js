// src/controllers/reference.controller.js
import * as ReferenceService from "../services/reference.service.js";

class ReferenceController {
  static async getFormasPagamento(req, res) {
    try {
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) {
        throw { status: 401, message: "Token não fornecido" };
      }

      const result = await ReferenceService.getFormasPagamento(token);
      res.json(result);
    } catch (error) {
      res.status(error.status || 500).json({
        message: error.message || "Erro ao buscar cliente",
      });
    }
  }

  static async getPortadores(req, res) {
    try {
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) {
        throw { status: 401, message: "Token não fornecido" };
      }

      const result = await ReferenceService.getPortadores(token);
      res.json(result);
    } catch (error) {
      res.status(error.status || 500).json({
        message: error.message,
      });
    }
  }

  static async getCategorias(req, res) {
    try {
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) {
        throw { status: 401, message: "Token não fornecido" };
      }

      const result = await ReferenceService.getCategorias(token);
      res.json(result);
    } catch (error) {
      res.status(error.status || 500).json({
        message: error.message,
      });
    }
  }

  static async getDepositos(req, res) {
    try {
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) {
        throw { status: 401, message: "Token não fornecido" };
      }

      const result = await ReferenceService.getDepositos(token);
      res.json(result);
    } catch (error) {
      res.status(error.status || 500).json({
        message: error.message,
      });
    }
  }

  static async getEstoque(req, res) {
    try {
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) {
        throw { status: 401, message: "Token não fornecido" };
      }

      const result = await ReferenceService.getEstoque(token);
      res.json(result);
    } catch (error) {
      res.status(error.status || 500).json({
        message: error.message,
      });
    }
  }

  static async getCliente(req, res) {
    try {
      const token = req.headers.authorization?.split(" ")[1];
  
      if (!token) {
        throw { status: 401, message: "Token não fornecido" };
      }
  
      const { search } = req.query;
  
      if (!search) {
        throw { status: 400, message: "search não fornecido" };
      }
  
      console.log('Token recebido:', token);
      console.log('search recebido:', search);
  
      const result = await ReferenceService.getCliente(token, search);
  
      res.json(result);
    } catch (error) {
      console.error('Erro no controlador:', error.message || error);
      res.status(error.status || 500).json({
        message: error.message,
      });
    }
  }
  
}

export default ReferenceController;
