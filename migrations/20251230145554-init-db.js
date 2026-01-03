module.exports = {
  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async up(db, client) {

    // === sale_states ===
    await db.collection("sale_states").insertMany([
      { name: "Completada" },
      { name: "Cancelada" },
      { name: "Abierta" }
    ]);

    // === purchase_states ===
    await db.collection("purchase_states").insertMany([
      { name: "Pendiente" },
      { name: "Aprobada" },
      { name: "Recibida" },
      { name: "Cancelada" }
    ]);

    // === pay_methods ===
    await db.collection("pay_methods").insertMany([
      { name: "Efectivo" },
      { name: "Tarjeta Débito" }
    ]);

    // === cateries ===
    await db.collection("categories").insertMany([
      { name: "Entradas" },
    ]);

    // === units ===
    await db.collection("units").insertMany([
      { name: "Unidad", symbol: "Ud" },
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
