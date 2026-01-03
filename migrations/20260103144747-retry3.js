module.exports = {
  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async up(db, client) {

    // === sale_states ===
    await db.collection("Sale_state").insertMany([
      { name: "Completada" },
      { name: "Cancelada" },
      { name: "Abierta" }
    ]);

    // === purchase_states ===
    await db.collection("Purchase_state").insertMany([
      { name: "Pendiente" },
      { name: "Aprobada" },
      { name: "Recibida" },
      { name: "Cancelada" }
    ]);

    // === pay_methods ===
    await db.collection("Pay_method").insertMany([
      { name: "Efectivo" },
      { name: "Tarjeta Débito" }
    ]);

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
