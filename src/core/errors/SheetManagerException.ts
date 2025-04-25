export class SheetManagerException extends Error {
    constructor(message: string) {
        super(message);
        this.name = "SheetManagerError";
        this.showModal();
    }

    protected showModal(): void {
        try {
            const template = HtmlService.createHtmlOutput(`
            <!DOCTYPE html>
            <html>
              <head>
                <base target="_top">
                <style>
                  body {
                    font-family: 'Segoe UI', sans-serif;
                    background-color: #fff3f3;
                    color: #a30000;
                    padding: 20px;
                  }
                  .error-box {
                    border: 1px solid #e0b4b4;
                    background-color: #ffe6e6;
                    padding: 20px;
                    border-radius: 8px;
                    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
                  }
                  h2 {
                    margin-top: 0;
                    color: #a30000;
                  }
                  pre {
                    background: #fff0f0;
                    border: 1px solid #f5c6cb;
                    padding: 10px;
                    overflow-x: auto;
                    font-size: 12px;
                    border-radius: 5px;
                    color: #5a0000;
                  }
                  .footer {
                    margin-top: 20px;
                    font-size: 0.9em;
                    color: #444;
                  }
                </style>
              </head>
              <body>
                <div class="error-box">
                  <h2>Произошла ошибка!</h2>
                  <strong>Имя:</strong> ${this.name}<br>
                  <strong>Сообщение:</strong> ${this.message}<br><br>
                  <strong>Стек вызова:</strong>
                  <pre>${this.stack}</pre>
                  <div class="footer">
                    Повторите попытку позже, если ошибка повторится — обратитесь к администратору.
                  </div>
                </div>
              </body>
            </html>
        `);

            const html = template.setWidth(600).setHeight(400);

            SpreadsheetApp.getUi().showModalDialog(html, "Произошла ошибка!");
        } catch (e) {}
    }
}
