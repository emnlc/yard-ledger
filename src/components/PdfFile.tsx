import React from "react";

import { Page, Text, View, Document, StyleSheet } from "@react-pdf/renderer";
import { User } from "../hooks/User";

interface Invoice {
  key: string | null;
  number: number;
  month: string;
  year: number;
  status: string;
  finalTotal: number;
  salesTax: number;
  applySales: boolean;
  subtotal: number;
}

interface Entry {
  date: string;
  desc: string;
  unitPrice?: number;
  unitType?: string;
  total: number;
  id: string;
}

interface Client {
  name: string;
  address: string;
  lot: string;
}

interface User {
  // name: string;
  email: string;
  company: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: number;
  a: string;
  r: string;
}

const styles = StyleSheet.create({
  page: {
    paddingVertical: "1in",
    paddingHorizontal: "1in",
  },

  container: {
    flexDirection: "column",
  },

  header: {
    marginBottom: "1cm",
  },

  h1: {
    fontSize: "27.5px",
    fontFamily: "Helvetica-Bold",
  },

  date: {
    fontSize: "11px",
    color: "#808080",
  },

  recipient: {
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: "12px",
    marginBottom: "1cm",
    color: "#808080",
  },

  table: {
    minHeight: "60%",
    flexDirection: "column",
    fontSize: "10px",
    borderBottom: 1,
    borderColor: "#A7A6A7",
  },

  tableRow: {
    flexDirection: "row",
    width: "100%",
  },

  th1: {
    color: "#205868",
    fontFamily: "Helvetica-Bold",
    backgroundColor: "#DBE4F0",
    width: "1.5in",
    paddingVertical: "2px",
    textAlign: "center",
    alignItems: "center",
    border: 1,
    borderColor: "#A7A6A7",
  },

  th2: {
    color: "#205868",
    fontFamily: "Helvetica-Bold",
    backgroundColor: "#DBE4F0",
    width: "100%",
    paddingVertical: "2px",
    textAlign: "center",
    alignItems: "center",
    borderTop: 1,
    borderBottom: 1,
    borderRight: 1,
    borderColor: "#A7A6A7",
  },

  th3: {
    color: "#205868",
    fontFamily: "Helvetica-Bold",
    backgroundColor: "#DBE4F0",
    width: "1.5in",
    paddingVertical: "2px",
    textAlign: "center",
    alignItems: "center",
    borderTop: 1,
    borderBottom: 1,
    borderRight: 1,
    borderColor: "#A7A6A7",
  },

  th4: {
    color: "#205868",
    fontFamily: "Helvetica-Bold",
    backgroundColor: "#DBE4F0",
    width: "1.5in",
    paddingVertical: "2px",
    textAlign: "center",
    alignItems: "center",
    borderTop: 1,
    borderBottom: 1,
    borderRight: 1,
    borderColor: "#A7A6A7",
  },

  columnContainer: {
    position: "absolute",
    flexDirection: "row",
    width: "100%",
    height: "100%",
  },

  tableCol1: {
    height: "100%",
    width: "1.5in",
    // backgroundColor: "red",
    borderLeft: 1,
    borderRight: 1,
    borderColor: "#A7A6A7",
  },
  tableCol2: {
    height: "100%",
    width: "100%",
    // backgroundColor: "blue",
    borderRight: 1,
    borderColor: "#A7A6A7",
  },
  tableCol3: {
    height: "100%",
    width: "1.5in",
    // backgroundColor: "green",
    borderRight: 1,
    borderColor: "#A7A6A7",
  },
  tableCol4: {
    height: "100%",
    width: "1.5in",
    // backgroundColor: "yellow",
    borderRight: 1,
    borderColor: "#A7A6A7",
  },

  td1: {
    width: "1.5in",
    paddingVertical: "2px",
    textAlign: "center",
    alignItems: "center",
  },
  td2: {
    width: "100%",
    paddingVertical: "2px",
    textAlign: "center",
    alignItems: "flex-start",
    paddingHorizontal: "2px",
  },
  td3: {
    width: "1.5in",
    paddingVertical: "2px",
    textAlign: "center",
    alignItems: "center",
  },
  td4: {
    width: "1.5in",
    paddingVertical: "2px",
    textAlign: "center",
    alignItems: "center",
  },

  spacer: {
    paddingVertical: "6px",
  },

  tableFooterContainer: {
    marginBottom: "2cm",
    fontSize: "10px",
  },

  tableFooterRow: {
    // fontSize: "7.5px",
    flexDirection: "row",
    justifyContent: "flex-end",
    width: "100%",
  },
  tf1: {
    width: "1.5in",
    paddingVertical: "2px",
    textAlign: "center",
    alignItems: "center",
  },
  tf2: {
    width: "100%",
    paddingVertical: "2px",
    textAlign: "center",
    alignItems: "flex-start",
    paddingHorizontal: "2px",
  },
  tf3: {
    width: "1.5in",
    fontFamily: "Helvetica-Bold",
    color: "#205868",
    paddingVertical: "2px",
    paddingHorizontal: "2px",
    textAlign: "right",
    alignItems: "flex-end",
  },
  tf4: {
    width: "1.53in",
    paddingVertical: "2px",
    textAlign: "center",
    alignItems: "center",
    borderLeft: 1,
    borderRight: 1,
    borderBottom: 1,
    borderColor: "#A7A6A7",
  },

  footer: {
    width: "100%",
    textAlign: "center",
    justifyContent: "center",
    fontSize: "10px",
    fontFamily: "Helvetica-Bold",
    color: "#205868",
  },
});

const PdfFile = ({
  invoice,
  entries,
  client,
  user,
}: {
  invoice: Invoice;
  entries: Entry[];
  client: Client;
  user: User;
}) => {
  const date = new Date();
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  const formattedDate = date.toLocaleDateString("en-US", options);

  return (
    <Document>
      <Page style={styles.page} size="A4">
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.h1}>INVOICE #{invoice.number}</Text>
            <Text style={styles.date}>Date: {formattedDate}</Text>
          </View>

          <View style={styles.recipient}>
            <View>
              <Text>{user.company}</Text>
              <Text>{user.address}</Text>
              <Text>
                {user.city}, {user.state} {user.zip}
              </Text>
              <Text>{user.phone}</Text>
              <Text>{user.email}</Text>
            </View>
            <View>
              <Text style={{ color: "#205868" }}>TO</Text>
            </View>

            <View style={{ alignItems: "flex-end" }}>
              <Text>{client.name}</Text>
              <Text>{client.address}</Text>
              <Text>{client.lot ? "Lot #" + client.lot : ""}</Text>
            </View>
          </View>

          {/* Table */}
          <View style={styles.table}>
            {/* Table Header */}
            <View style={styles.columnContainer}>
              <View style={styles.tableCol1}></View>
              <View style={styles.tableCol2}></View>
              <View style={styles.tableCol3}></View>
              <View style={styles.tableCol4}></View>
            </View>

            <View style={styles.tableRow}>
              <View style={styles.th1}>
                <Text>DATE</Text>
              </View>

              <View style={styles.th2}>
                <Text>DESCRIPTION</Text>
              </View>

              <View style={styles.th3}>
                <Text>UNIT TOTAL</Text>
              </View>

              <View style={styles.th4}>
                <Text>LINE TOTAL</Text>
              </View>
            </View>

            {/* Table Content */}
            {entries.map((entry) => (
              <React.Fragment key={entry.id}>
                <View style={styles.tableRow}>
                  <View style={styles.td1}>
                    <Text>{entry.date}</Text>
                  </View>
                  <View style={styles.td2}>
                    <Text>{entry.desc}</Text>
                  </View>
                  <View style={styles.td3}>
                    <Text>
                      $
                      {entry.unitType
                        ? `${entry.unitPrice} / ${entry.unitType}`
                        : entry.unitPrice}
                    </Text>
                  </View>
                  <View style={styles.td4}>
                    <Text>${entry.total}</Text>
                  </View>
                </View>
                <View style={styles.spacer}></View>
              </React.Fragment>
            ))}
          </View>
          {/* Table Footer */}
          <View style={styles.tableFooterContainer}>
            <View style={styles.tableFooterRow}>
              <View style={styles.tf1}></View>
              <View style={styles.tf2}>
                <Text>Account #: {user.a}</Text>
              </View>
              <View style={styles.tf3}>
                <Text>SUBTOTAL</Text>
              </View>
              <View style={styles.tf4}>
                <Text>${invoice.subtotal}</Text>
              </View>
            </View>

            <View style={styles.tableFooterRow}>
              <View style={styles.tf1}></View>
              <View style={styles.tf2}>
                <Text>Routing #: {user.r}</Text>
              </View>
              <View style={styles.tf3}>
                <Text>SALES TAX</Text>
              </View>
              <View style={styles.tf4}>
                <Text>${invoice.salesTax}</Text>
              </View>
            </View>

            <View style={styles.tableFooterRow}>
              <View style={styles.tf1}></View>
              <View style={styles.tf2}></View>
              <View style={styles.tf3}>
                <Text>TOTAL</Text>
              </View>
              <View style={styles.tf4}>
                <Text>${invoice.finalTotal}</Text>
              </View>
            </View>
          </View>

          <View style={styles.footer}>
            <Text>Thank you for your business!</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default PdfFile;
