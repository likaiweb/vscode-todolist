import * as vscode from "vscode";

export default class ToDoListProvider implements vscode.WebviewViewProvider {
  private _view?: vscode.WebviewView;
  private _context: vscode.ExtensionContext;
  constructor(context: vscode.ExtensionContext) {
    this._context = context;
  }
  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    token: vscode.CancellationToken
  ) {
    this._view = webviewView;
    this._view.webview.options = {
      enableScripts: true,
    };
    this._view.webview.html = this.getHtmlForWebview();
    this._view.webview.onDidReceiveMessage(
      (message) => {
        switch (message.command) {
          case "save":
            vscode.window.showInformationMessage(message.text);
            return;
          case "clearSave":
            vscode.window.showInformationMessage(message.text);
            return;
        }
      },
      undefined,
      this._context.subscriptions
    );
  }
  private getHtmlForWebview() {
    return `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>toDoList</title>
    <style>
      :root {
        --theme: rgb(136, 136, 136);
        --theme2: rgba(136, 136, 136, 0.6);
      }
      html,
      body {
        color: var(--theme);
        padding: 0;
        margin: 0;
        user-select: none;
      }
      .clear {
        display: flex;
        align-items: center;
        width: 90%;
        margin: 10px auto 0;
      }
      .clear span {
        margin-right: auto;
      }
      .clear div {
        margin: 0 5px;
        cursor: pointer;
      }
      .clear .showIcon {
        width: 30px;
        height: 30px;
        background: url("https://yppphoto.hellobixin.com/yppphoto/bb6e49a5feef4b6799aa27c9a4d03eda.png")
          center top;
        background-size: 100%;
      }
      .clear .showIcon.showAll {
        background: url("https://yppphoto.hellobixin.com/yppphoto/e4d53acc2e1c4131bbf90461070d2a68.png")
          center top;
        background-size: 100%;
      }
      .clear .clearIcon {
        width: 20px;
        height: 20px;
        background: url("https://yppphoto.hellobixin.com/yppphoto/42ab07cf0501426bac7aaa16e3157cbf.png")
          center top;
        background-size: 100%;
      }
      .list {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding-top: 20px;
      }
      .item {
        width: 90%;
        display: flex;
        align-items: center;
        height: 50px;
        border-bottom: 1px solid var(--theme2);
        transition: all 0.3s;
        overflow: hidden;
      }
      .itemDone {
        opacity: 0.5;
      }
      .check {
        margin-right: 10px;
        width: 16px;
        height: 16px;
        border: 1px solid var(--theme);
        border-radius: 50%;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .check div {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: var(--theme);
      }
      .content {
        margin-right: auto;
      }
      .date {
        color: var(--theme2);
        font-size: 12px;
      }
      input {
        width: 90%;
        height: 30px;
        border: 0;
        outline: none;
        font-size: 16px;
        background: transparent;
        color: var(--theme);
      }
      input:focus {
        outline: none;
      }
      input::placeholder {
        color: var(--theme2);
      }
      .removeBtn {
        color: var(--theme2);
        font-size: 20px;
        margin-right: 5px;
        cursor: pointer;
      }
      .addBtn {
        width: 10%;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
        color: var(--theme);
        cursor: pointer;
      }
    </style>
    <script src="https://cdn.jsdelivr.net/npm/vue@2"></script>
    <script src="https://cdn.jsdelivr.net/npm/dayjs@1/dayjs.min.js"></script>
  </head>
  <body>
    <div id="app">
      <div class="clear">
        <span>已完成事项（{{doneList.length}}）</span>
        <div
          class="showIcon"
          :class="showAll&&'showAll'"
          @click="showAll = !showAll"
          :title="showAll?'隐藏已完成事项':'显示全部事项'"
        ></div>
        <div
          class="clearIcon"
          title="清空已完成事项"
          @click="clearDoneData"
        ></div>
      </div>
      <div class="list">
        <div class="item">
          <input
            type="text"
            @keyup.enter="addData"
            placeholder="添加事项"
            v-model="value"
          />
          <div class="addBtn" @click="addData">+</div>
        </div>
        <div
          class="item"
          :class="v.done && 'itemDone'"
          v-for="(v,i) in list"
          :key="i"
        >
          <div class="check" @click="handleDone(i)">
            <div v-if="v.done"></div>
          </div>
          <div class="content">
            <div class="text">{{v.value}}</div>
            <div class="date">时间：{{v.date}}</div>
          </div>
          <div class="removeBtn" v-if="!v.done" @click="removeData(i)">×</div>
        </div>
      </div>
    </div>
  </body>
</html>
<script>
  const todoList = "RICK_toDoList";
  const doneList = "RICK_doneList";
  const vscode = acquireVsCodeApi();
  let timer = null;
  new Vue({
    el: "#app",
    data: {
      undoneList: localStorage[todoList]
        ? JSON.parse(localStorage[todoList])
        : [],
      doneList: localStorage[todoList]
        ? JSON.parse(localStorage[doneList])
        : [],
      value: "",
      showAll: false,
    },
    computed: {
      list({ undoneList, doneList, showAll }) {
        return showAll ? [...undoneList, ...doneList] : undoneList;
      },
    },
    methods: {
      // 添加
      addData() {
        if (!this.value) return;
        this.undoneList.unshift({
          value: this.value,
          date: dayjs().format("MM-DD HH:mm:ss"),
          done: false,
        });
        this.value = "";
        localStorage[todoList] = JSON.stringify(this.list);
      },
      // 删除
      removeData(index) {
        this.undoneList.splice(index, 1);
        localStorage[todoList] = JSON.stringify(this.list);
      },
      // 清除已完成
      clearDoneData() {
        this.doneList = [];
        localStorage[doneList] = JSON.stringify(this.doneList);
        vscode.postMessage({
          command: "clearSave",
          text: "已清空完成事项！",
        });
      },
      // 完成
      handleDone(index) {
        this.undoneList.forEach((v, i) => {
          if (i === index) {
            v.done = !v.done;
          }
        });
        timer && clearTimeout(timer);
        timer = setTimeout(() => {
          this.sortList();
        }, 2000);
      },
      sortList() {
        this.doneList = [
          ...this.undoneList.filter((v) => v.done),
          ...this.doneList,
        ];
        this.undoneList = [...this.undoneList.filter((v) => !v.done)];
        localStorage[todoList] = JSON.stringify(this.undoneList);
        localStorage[doneList] = JSON.stringify(this.doneList);
      },
    },
  });
</script>

    `;
  }
}
