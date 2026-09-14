// ============================================================================
// Fashion Shop POS & Inventory Management - Google Apps Script (Code.gs)
// ============================================================================

/**
 * Serves the POS web application when the deployed Web App URL is visited
 */
function doGet(e) {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle("Fashion Shop POS & Inventory Management")
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

/**
 * Adds a custom menu directly inside Google Sheets to open POS
 */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('🏪 POS System')
    .addItem('সফটওয়্যার ড্যাশবোর্ড খুলুন (Open POS)', 'openPOSDialog')
    .addItem('শিট ট্যাব তৈরি ও ফরম্যাট করুন (Setup Sheets)', 'setupShopSheets')
    .addToUi();
}

/**
 * Opens the POS inside a Google Sheets popup dialog
 */
function openPOSDialog() {
  var html = HtmlService.createHtmlOutputFromFile('Index')
    .setWidth(1200)
    .setHeight(850);
  SpreadsheetApp.getUi().showModalDialog(html, 'Fashion Shop POS & Inventory');
}

/**
 * Ensures all 6 sheets exist with formatted colored headers
 */
function setupShopSheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  var sheets = [
    {
      name: "Products",
      headers: ["Product ID", "Product Name", "Category", "Purchase Price", "Sale Price", "Current Stock", "Status"],
      color: "#1e824c"
    },
    {
      name: "Stock",
      headers: ["Product ID", "Product Name", "Purchase Qty", "Sold Qty", "Available Stock", "Supplier", "Last Updated"],
      color: "#0284c7"
    },
    {
      name: "Sales",
      headers: ["Invoice No", "Date", "Customer Name", "Phone", "Items Summary", "Subtotal", "Discount", "Net Total", "Paid Amount", "Due Amount", "Payment Method", "Remarks"],
      color: "#7c3aed"
    },
    {
      name: "Customers",
      headers: ["Customer ID", "Customer Name", "Phone", "Total Purchases", "Total Paid", "Current Due", "Status"],
      color: "#dc2626"
    },
    {
      name: "Due_Collections",
      headers: ["Collection Date", "Collection ID", "Customer Name", "Phone", "Amount Collected", "Payment Method", "Remaining Due", "Remarks"],
      color: "#d97706"
    },
    {
      name: "Expenses",
      headers: ["Date", "Expense ID", "Category", "Amount", "Note", "Payment Method"],
      color: "#0d9488"
    }
  ];

  sheets.forEach(function(sh) {
    var sheet = ss.getSheetByName(sh.name) || ss.insertSheet(sh.name);
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(sh.headers);
      sheet.getRange(1, 1, 1, sh.headers.length)
        .setBackground(sh.color)
        .setFontColor("#ffffff")
        .setFontWeight("bold");
    }
  });

  SpreadsheetApp.getActive().toast("সকল ৬টি শিট ট্যাব সফলভাবে প্রস্তুত হয়েছে!", "POS System", 5);
}

/**
 * Loads all data from Google Sheets into the POS frontend
 */
function getShopData() {
  setupShopSheets();
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var result = {
    products: [],
    stock: [],
    sales: [],
    customers: [],
    duePayments: [],
    expenses: []
  };

  // Products
  var prodSheet = ss.getSheetByName("Products");
  if (prodSheet && prodSheet.getLastRow() > 1) {
    var prodValues = prodSheet.getRange(2, 1, prodSheet.getLastRow() - 1, 7).getValues();
    result.products = prodValues.map(function(r) {
      return {
        id: String(r[0]),
        name: String(r[1]),
        category: String(r[2]),
        purchasePrice: Number(r[3]) || 0,
        salePrice: Number(r[4]) || 0,
        currentStock: Number(r[5]) || 0,
        status: String(r[6] || "In Stock")
      };
    });
  }

  // Stock
  var stockSheet = ss.getSheetByName("Stock");
  if (stockSheet && stockSheet.getLastRow() > 1) {
    var stockValues = stockSheet.getRange(2, 1, stockSheet.getLastRow() - 1, 7).getValues();
    result.stock = stockValues.map(function(r) {
      return {
        productId: String(r[0]),
        productName: String(r[1]),
        purchaseQty: Number(r[2]) || 0,
        soldQty: Number(r[3]) || 0,
        currentStock: Number(r[4]) || 0,
        supplier: String(r[5] || ""),
        lastUpdated: String(r[6] || "")
      };
    });
  }

  // Sales
  var salesSheet = ss.getSheetByName("Sales");
  if (salesSheet && salesSheet.getLastRow() > 1) {
    var salesValues = salesSheet.getRange(2, 1, salesSheet.getLastRow() - 1, 12).getValues();
    result.sales = salesValues.map(function(r) {
      return {
        invoiceNo: String(r[0]),
        date: String(r[1]),
        customerName: String(r[2]),
        phone: String(r[3]),
        itemsSummary: String(r[4]),
        subtotal: Number(r[5]) || 0,
        discount: Number(r[6]) || 0,
        netTotal: Number(r[7]) || 0,
        payment: Number(r[8]) || 0,
        due: Number(r[9]) || 0,
        paymentMethod: String(r[10] || "Cash"),
        remarks: String(r[11] || "")
      };
    });
  }

  // Customers
  var custSheet = ss.getSheetByName("Customers");
  if (custSheet && custSheet.getLastRow() > 1) {
    var custValues = custSheet.getRange(2, 1, custSheet.getLastRow() - 1, 7).getValues();
    result.customers = custValues.map(function(r) {
      return {
        id: String(r[0]),
        name: String(r[1]),
        phone: String(r[2]),
        totalPurchases: Number(r[3]) || 0,
        totalPaid: Number(r[4]) || 0,
        currentDue: Number(r[5]) || 0,
        status: String(r[6] || "Regular")
      };
    });
  }

  // Due Payments
  var dueSheet = ss.getSheetByName("Due_Collections");
  if (dueSheet && dueSheet.getLastRow() > 1) {
    var dueValues = dueSheet.getRange(2, 1, dueSheet.getLastRow() - 1, 8).getValues();
    result.duePayments = dueValues.map(function(r) {
      return {
        date: String(r[0]),
        id: String(r[1]),
        customerName: String(r[2]),
        phone: String(r[3]),
        amount: Number(r[4]) || 0,
        paymentMethod: String(r[5] || "Cash"),
        remainingDue: Number(r[6]) || 0,
        remarks: String(r[7] || "")
      };
    });
  }

  // Expenses
  var expSheet = ss.getSheetByName("Expenses");
  if (expSheet && expSheet.getLastRow() > 1) {
    var expValues = expSheet.getRange(2, 1, expSheet.getLastRow() - 1, 6).getValues();
    result.expenses = expValues.map(function(r) {
      return {
        date: String(r[0]),
        id: String(r[1]),
        category: String(r[2]),
        amount: Number(r[3]) || 0,
        note: String(r[4] || ""),
        paymentMethod: String(r[5] || "Cash")
      };
    });
  }

  return JSON.stringify(result);
}

/**
 * Saves all records from the frontend into the Google Sheets
 */
function saveAllShopData(jsonData) {
  var data = typeof jsonData === "string" ? JSON.parse(jsonData) : jsonData;
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  // 1. Products
  if (data.products && data.products.length > 0) {
    var prodSheet = ss.getSheetByName("Products") || ss.insertSheet("Products");
    prodSheet.clear();
    var pHeaders = ["Product ID", "Product Name", "Category", "Purchase Price", "Sale Price", "Current Stock", "Status"];
    var pRows = [pHeaders];
    data.products.forEach(function(p) {
      pRows.push([p.id || "", p.name || "", p.category || "", p.purchasePrice || 0, p.salePrice || 0, p.currentStock || 0, p.status || "In Stock"]);
    });
    prodSheet.getRange(1, 1, pRows.length, pHeaders.length).setValues(pRows);
    prodSheet.getRange(1, 1, 1, pHeaders.length).setBackground("#1e824c").setFontColor("#ffffff").setFontWeight("bold");
  }

  // 2. Stock
  if (data.stock && data.stock.length > 0) {
    var stockSheet = ss.getSheetByName("Stock") || ss.insertSheet("Stock");
    stockSheet.clear();
    var sHeaders = ["Product ID", "Product Name", "Purchase Qty", "Sold Qty", "Available Stock", "Supplier", "Last Updated"];
    var sRows = [sHeaders];
    data.stock.forEach(function(s) {
      sRows.push([s.productId || "", s.productName || "", s.purchaseQty || 0, s.soldQty || 0, s.currentStock || 0, s.supplier || "", s.lastUpdated || new Date().toISOString()]);
    });
    stockSheet.getRange(1, 1, sRows.length, sHeaders.length).setValues(sRows);
    stockSheet.getRange(1, 1, 1, sHeaders.length).setBackground("#0284c7").setFontColor("#ffffff").setFontWeight("bold");
  }

  // 3. Sales
  if (data.sales && data.sales.length > 0) {
    var salesSheet = ss.getSheetByName("Sales") || ss.insertSheet("Sales");
    salesSheet.clear();
    var slHeaders = ["Invoice No", "Date", "Customer Name", "Phone", "Items Summary", "Subtotal", "Discount", "Net Total", "Paid Amount", "Due Amount", "Payment Method", "Remarks"];
    var slRows = [slHeaders];
    data.sales.forEach(function(s) {
      var itemsSummary = s.itemsSummary || (s.items || []).map(function(it) {
        return (it.productName || "") + " (" + (it.qty || 1) + "x" + (it.salePrice || 0) + ")";
      }).join("; ");
      slRows.push([s.invoiceNo || "", s.date || "", s.customerName || "", s.phone || "", itemsSummary, s.subtotal || 0, s.discount || 0, s.netTotal || 0, s.payment || 0, s.due || 0, s.paymentMethod || "Cash", s.remarks || ""]);
    });
    salesSheet.getRange(1, 1, slRows.length, slHeaders.length).setValues(slRows);
    salesSheet.getRange(1, 1, 1, slHeaders.length).setBackground("#7c3aed").setFontColor("#ffffff").setFontWeight("bold");
  }

  // 4. Customers
  if (data.customers && data.customers.length > 0) {
    var custSheet = ss.getSheetByName("Customers") || ss.insertSheet("Customers");
    custSheet.clear();
    var cHeaders = ["Customer ID", "Customer Name", "Phone", "Total Purchases", "Total Paid", "Current Due", "Status"];
    var cRows = [cHeaders];
    data.customers.forEach(function(c) {
      cRows.push([c.id || "", c.name || "", c.phone || "", c.totalPurchases || 0, c.totalPaid || 0, c.currentDue || 0, c.status || "Regular"]);
    });
    custSheet.getRange(1, 1, cRows.length, cHeaders.length).setValues(cRows);
    custSheet.getRange(1, 1, 1, cHeaders.length).setBackground("#dc2626").setFontColor("#ffffff").setFontWeight("bold");
  }

  // 5. Due Collections
  if (data.duePayments && data.duePayments.length > 0) {
    var dueSheet = ss.getSheetByName("Due_Collections") || ss.insertSheet("Due_Collections");
    dueSheet.clear();
    var dHeaders = ["Collection Date", "Collection ID", "Customer Name", "Phone", "Amount Collected", "Payment Method", "Remaining Due", "Remarks"];
    var dRows = [dHeaders];
    data.duePayments.forEach(function(d) {
      dRows.push([d.date || "", d.id || "", d.customerName || "", d.phone || "", d.amount || 0, d.paymentMethod || "Cash", d.remainingDue || 0, d.remarks || ""]);
    });
    dueSheet.getRange(1, 1, dRows.length, dHeaders.length).setValues(dRows);
    dueSheet.getRange(1, 1, 1, dHeaders.length).setBackground("#d97706").setFontColor("#ffffff").setFontWeight("bold");
  }

  // 6. Expenses
  if (data.expenses && data.expenses.length > 0) {
    var expSheet = ss.getSheetByName("Expenses") || ss.insertSheet("Expenses");
    expSheet.clear();
    var eHeaders = ["Date", "Expense ID", "Category", "Amount", "Note", "Payment Method"];
    var eRows = [eHeaders];
    data.expenses.forEach(function(e) {
      eRows.push([e.date || "", e.id || "", e.category || "", e.amount || 0, e.note || "", e.paymentMethod || "Cash"]);
    });
    expSheet.getRange(1, 1, eRows.length, eHeaders.length).setValues(eRows);
    expSheet.getRange(1, 1, 1, eHeaders.length).setBackground("#0d9488").setFontColor("#ffffff").setFontWeight("bold");
  }

  return { success: true, message: "গুগল শিটের সব ট্যাব সফলভাবে আপডেট হয়েছে!" };
}
