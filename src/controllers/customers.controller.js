import * as CustomersService from "../services/customers.service.js";

export class CustomersController {
  static async create(req, res) {
    try {
      const token = req.headers.authorization?.replace("Bearer ", "");
      const result = await CustomersService.createCustomer(req.body, token);
      res.status(201).json(result);
    } catch (error) {
      res.status(error.status || 500).json({
        message: error.message,
        details: error.details || [],
      });
    }
  }

  static async uploadBulk(req, res) {
    try {
      if (!req.file) {
        throw { status: 400, message: "Nenhum arquivo foi enviado" };
      }

      const token = req.headers.authorization?.replace("Bearer ", "");
      const result = await CustomersService.processExcelCustomers(
        req.file.buffer,
        token
      );
      res.status(200).json(result);
    } catch (error) {
      res.status(error.status || 500).json({
        message: error.message,
        details: error.details || [],
      });
    }
  }

  static async downloadTemplate(req, res) {
    try {
      const buffer = await CustomersService.getExcelTemplate();
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=template_clientes.xlsx"
      );
      res.send(buffer);
    } catch (error) {
      res.status(error.status || 500).json({
        message: error.message,
      });
    }
  }
}
