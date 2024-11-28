import PineconeRouter from "pinecone-router"
import Alpine from "alpinejs"
import RichTextEditor from "./rich_text_editor"

customElements.define('rich-textarea', RichTextEditor);

Alpine.plugin(PineconeRouter);
window.Alpine = Alpine;


window.state = {
  logins: {
    username: "",
    password: "",
  },
  login() {
    console.log(JSON.stringify(this.$router.navigate('/home')))
  },
  questions: [
    {
      text: "Test Question 1",
      answers: [
        {text: "yes", isRight: true},
        {text: "no", isRight: false},
        {text: "may be", isRight: false},
        {text: "Dunno", isRight: false},
      ]
    },
  {
      text: "Test Question 2",
      answers: [
        {text: "yes", isRight: true},
        {text: "no", isRight: false},
        {text: "may be", isRight: false},
        {text: "Dunno", isRight: false},
      ]
  },
  {
      text: "Test Question 3",
      answers: [
        {text: "yes", isRight: true},
        {text: "no", isRight: false},
        {text: "may be", isRight: false},
        {text: "Dunno", isRight: false},
      ]
    },


  ],
  getText() {
    alert(this.questions);
  }
}

Alpine.start();
