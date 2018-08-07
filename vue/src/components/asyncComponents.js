import basiccard from './BasicCard'
export default {
  name: 'async-components',
  props:['content'],
  data (){
    return {
      tags: [],
      contents:[],
    }
  },
  components: {
    'basic-card': basiccard
  },
  methods: {
    // Create a map: tag -> content, make it as the input of the createVDom and loop over
    parseContent() {
      // Create the pormise
      const API_BASE = "http://localhost:4141/fn"

      const readCardPromise = (name, data) => {
        const url = `${API_BASE}/card/${name}`
        return fetch(url, {
          method: 'post',
          body: (data),
        }).then(r => r.text())
      }

      var hashList = this.content.match(/[A-Za-z0-9]{46}/g)
      readCardPromise('cardRead', String(hashList)).then(result => {
        var cardContents = result.split("|")
        var counter = 0
        var pos = 0
        var temp_tags = []
        var temp_contents = []

        this.content.replace(/{{\w{46}}}/g,
          function(match, offset, s){
            // push the previous string
            if (offset !== 0) {
              temp_contents.push(s.substring(pos, offset))
              temp_tags.push('div')
            }

            // push the current string
            pos = offset + match.length
            console.log("Get the content of the card" + cardContents[counter])
            temp_contents.push(cardContents[counter]);
            temp_tags.push(basiccard)

            counter++;

            return match;
          });

          this.contents = temp_contents
          this.tags = temp_tags;
      });
    }
  },
  created() {
    this.parseContent();
  },
  render(h) {
    console.log(this.tags);
    console.log(this.contents);
    if (this.contents.length !== 0 && (this.contents.length === this.tags.length)) {
      const children = this.tags.map((tag, i) => {
        let curCardProps = JSON.parse(this.contents[i])
        console.log("???" + curCardProps.title)
        return h(tag, {
          data: {
            name: curCardProps.title,
            content: curCardProps.content,
            cardTypes: curCardProps.card_type,
          }
        })
      })
      return h('div', children);
    } else {
      return h('div', "something wrong here");
    }
  }
}
