module.exports = {
  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async up(db, client) {

    // === sale_states ===
    const result_sale_states = await db.collection("Sale_state").insertMany([
      { name: "Completada" },
      { name: "Cancelada" },
      { name: "Abierta" }
    ]);

    console.log("✅ Sale_state insertados correctamente", result_sale_states);

    // === purchase_states ===
    const result_purchase_states = await db.collection("Purchase_state").insertMany([
      { name: "Pendiente" },
      { name: "Aprobada" },
      { name: "Recibida" },
      { name: "Cancelada" }
    ]);

    console.log("✅ Purchase_state insertados correctamente", result_purchase_states);

    // === pay_methods ===
    const result_pay_methods = await db.collection("Pay_method").insertMany([
      { name: "Efectivo" },
      { name: "Tarjeta Débito" }
    ]);

    console.log("✅ Pay_method insertados correctamente", result_pay_methods);

    console.log("✅ Datos insertados correctamente");

  },

  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async down(db, client) {
    // TODO write the statements to rollback your migration (if possible) ok
  }
};
