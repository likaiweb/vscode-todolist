import * as vscode from 'vscode';

export default class ToDoListProvider implements vscode.WebviewViewProvider {
    private _view ? : vscode.WebviewView;
    private _context :vscode.ExtensionContext;
    constructor(context:vscode.ExtensionContext){
        this._context = context;
    }
    public resolveWebviewView(webviewView: vscode.WebviewView,context: vscode.WebviewViewResolveContext,token: vscode.CancellationToken){
		  this._view = webviewView;
      this._view.webview.options = {
          enableScripts: true,
      };
      this._view.webview.html = this.getHtmlForWebview();
    }
    private getHtmlForWebview() {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>toDoList</title>
    <style>
        :root{
            --theme:rgba(136,136,136,1);
            --theme2:rgba(136,136,136,.6)
        }
        body{
            color: var(--theme);
        }
        .list{
            display: flex;
            flex-direction: column;
            align-items: center;
            padding-top:20px;
        }
        .item{
            width: 90%;
            display: flex;
            align-items: center;
            height: 50px;
            border-bottom: 1px solid var(--theme);
            transition: all .3s;
            overflow: hidden;
        }
        .itemDone{
            opacity: .5;
        }
        .check{
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
        .check div{
            width: 12px;
            height:12px;
            border-radius: 50%;
            background: var(--theme);
        }
        .content{
            margin-right: auto;
        }
        .date{
            color: var(--theme2);
            font-size: 12px;
        }
        input{
            width:90%;
            height: 30px;
            border: 0;
            outline: none;
            font-size: 16px;
            background: transparent;
            color: var(--theme);
        }
        input:focus{
            outline:none;
        }
        input::placeholder{
            color: var(--theme2);
        }
        .removeBtn{
            color: var(--theme2);
            font-size: 20px;
            margin-right: 5px;
            cursor: pointer;
        }
        .addBtn{
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
        <div class="list">
            <div class="item">
                <input type="text" @keyup.enter="addData" placeholder="添加事项" v-model="value">
                <div class="addBtn" @click="addData">+</div>
            </div>
            <div class="item" :class="v.done && 'itemDone'" v-for="(v,i) in list" :key="i">
                <div class="check" @click="handleDone(i)">
                    <div v-if="v.done"></div>
                </div>
                <div class="content">
                    <div class="text">{{v.value}}</div>
                    <div class="date">时间：{{v.date}}</div>
                </div>
                <div class="removeBtn" @click="removeData(i)">×</div>
            </div>
        </div>
    </div>
</body>
</html>
<script>
    new Vue({
        el:"#app",
        data:{
            list: localStorage.toDoList ? JSON.parse(localStorage.toDoList) : [],
            value:''
        },
        methods:{
            addData(){
                if(!this.value)return
                this.list.unshift({
                    value:this.value,
                    date: dayjs().format('MM-DD HH:mm:ss'),
                    done:false
                 })
                this.value=''
                localStorage.toDoList=JSON.stringify(this.list);
            },
            removeData(index){
                this.list.splice(index, 1)
                localStorage.toDoList = JSON.stringify(this.list);
            },
            handleDone(index){
                this.list.forEach((v,i)=>{
                    if(i===index){
                        v.done = true
                    }
                })
                setTimeout(() => {
                    this.sortList()
                }, 2000);
            },
            sortList(){
                this.list = [...this.list.filter(v=>!v.done), ...this.list.filter(v => v.done)]
                localStorage.toDoList = JSON.stringify(this.list);
            }
        }
    })
</script>
    `;
    }
}
