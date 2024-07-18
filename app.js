var nodemailer = require("nodemailer");
var nodeoutlook = require("nodejs-nodemailer-outlook");
const express = require("express");
const imaps = require("imap-simple");
const _ = require("lodash");
const app = express();

app.get("/outlook", function (req, res) {
  nodeoutlook.sendEmail({
    auth: {
      user: "dev.yhaddou@outlook.com",
      pass: "Toulouse_31100",
    },
    from: "dev.yhaddou@outlook.com",
    to: "younesshaddou31@gmail.com",
    subject: "SEND MAIL TEST",
    html: "<b>This is bold text</b>",
    text: "This is text version!",
    replyTo: "",

    onError: (e) => console.log(e),
    onSuccess: (i) => res.send("Email envoyé"),
  });
});

app.get("/unread-mails", function (req, res) {
  const config = {
    imap: {
      user: "dev.yhaddou@outlook.com",
      password: "Toulouse_31100",
      host: "outlook.office365.com",
      port: 993,
      tls: true,
      authTimeout: 3000,
    },
  };

  imaps
    .connect(config)
    .then(function (connection) {
      return connection.openBox("INBOX").then(function () {
        const searchCriteria = ["UNSEEN"];
        const fetchOptions = {
          bodies: ["HEADER", "TEXT"],
          markSeen: false,
        };

        return connection
          .search(searchCriteria, fetchOptions)
          .then(function (messages) {
            const emails = messages.map(function (item) {
              const all = _.find(item.parts, { which: "HEADER" }).body;
              const body = _.find(item.parts, { which: "TEXT" }).body;
              return {
                subject: all.subject[0],
                from: all.from[0],
                date: all.date[0],
                body: body,
              };
            });

            res.json(emails);
          });
      });
    })
    .catch(function (err) {
      console.log(err);
      res.status(500).send("Error fetching emails");
    });
});

// Le serveur ecoute sur le port 3022
app.set("port", process.env.PORT || 3000);

app.listen(app.get("port"), () => {
  console.log(`server on port ${app.get("port")}`);
});
