<template>
  <div>
    <nav class="navbar navbar-expand-md navbar-dark">
      <div class="container-fluid">
        <!-- <a class="navbar-brand" href="#">Navbar</a> -->
        <ul class="navbar-nav me-auto my-auto w-100">
          <li class="nav-item">
            <input type="text" class="bg-transparent text-light border-0 paste-name-input" v-model="paste_name"
              placeholder="New Paste">
          </li>
        </ul>
        <div class="collapse navbar-collapse" id="navbarSupportedContent">
          <ul class="navbar-nav me-auto my-auto">
          </ul>
          <div class="mr-0">
            <ul class="navbar-nav">
              <li class="nav-item">
                <a class="nav-link active text-white border border-1 rounded mx-1 py-0 px-3 icon-menu text-nowrap"
                  data-bs-toggle="modal" data-bs-target="#expirationModal" type="button">
                  <i class="fa fa-clock-o"></i> <span v-show="expiration != 'never'" class="fs-6">{{ exp }}</span>
                </a>
              </li>
              <li class="nav-item">
                <a class="nav-link active text-white border border-1 rounded mx-1 py-0 px-3 icon-menu text-nowrap"
                  data-bs-toggle="modal" data-bs-target="#protectModal" type="button" @click="focusPassword">
                  <i class="fa fa-lock"></i> <span v-show="password" class="fs-6">On</span>
                </a>
              </li>
              <li class="nav-item my-auto">
                <select class="form-select form-select-sm text-dark bg-light" v-model="language_selected">
                  <option v-for="language in language_list" :value="language">
                    {{ language }}
                  </option>
                </select>
              </li>
              <li class="nav-item">
                <a class="nav-link active text-white border border-1 rounded mx-1 py-0 px-3 icon-menu icon-save"
                  type="button" @click="save">
                  <i class="fa fa-floppy-o"></i>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </nav>
    <div class="pt-0 raw-input">
      <div class="d-flex">
        <div class="col-auto">
          <div class="lines">
            <ul class="list-inline w-100">
              <li v-for="i in lines" class="border-end border-color px-2 me-2">
                {{ i }}
              </li>
            </ul>
          </div>
        </div>
        <div class="col">
          <textarea autofocus="autofocus" id="text" tabindex="1" class="w-100 h-100 bg-transparent border-0 text-light" name="text"
            rows="10" wrap="off" v-model="text">{{ text }}</textarea>
        </div>
      </div>
    </div>
    <div class="d-md-none bg-dark text-light mobile-menu">
      <ul class="list-group">
        <li class="list-group-item border-0 pt-4">
          <a class="nav-link active text-white border border-1 rounded mx-1 py-0 px-3 icon-menu" data-bs-toggle="modal"
            data-bs-target="#expirationModal" type="button">
            <i class="fa fa-clock-o"></i> <span class="ps-1">Expiration</span> <span v-show="expiration != 'never'"
              class="fs-6">[{{ exp }}]</span>
          </a>
        </li>
        <li class="list-group-item border-0">
          <a class="nav-link active text-white border border-1 rounded mx-1 py-0 px-3 icon-menu" data-bs-toggle="modal"
            data-bs-target="#protectModal" type="button" @click="focusPassword">
            <i class="fa fa-lock"></i> <span class="ps-1">Password</span> <span v-show="password" class="fs-6">On</span>
          </a>
        </li>
        <li class="list-group-item border-0">
          <div class="nav-link active text-white border border-1 rounded mx-1 py-0" href="#">
            <select class="form-select form-select-sm text-dark bg-light" v-model="language_selected">
              <option v-for="language in language_list" :value="language">
                {{ language }}
              </option>
            </select>
          </div>
        </li>
        <li class="list-group-item border-0 pb-4">
          <a class="nav-link active text-white border border-1 rounded mx-1 py-0 px-3 icon-menu icon-save d-md-none sv"
            type="button" @click="save">
            <i class="fa fa-floppy-o"></i> <span class="ps-1">Save</span>
          </a>
        </li>
      </ul>
    </div>

    <div class="modal fade" id="expirationModal" tabindex="-1" aria-labelledby="expirationModalLabel" aria-hidden="true">
      <div class="modal-dialog text-dark">
        <div class="modal-content">
          <div class="modal-header">
            <h3 class="modal-title fs-5 fw-bold" id="expirationModalLabel">Expiration</h3>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"
              id="closeExpirationModal"></button>
          </div>
          <div class="modal-body">
            <p>How much time do we have before this paste expires?</p>
            <div class="w-100 text-center">
              <div type="button" class="btn btn-sm border border-2 text-capitalize mb-1"
                :class="{ 'bg-secondary-subtle': expiration == 'never' }" @click="setExpiration('never'); exp = 'never'">
                never</div>
              <div type="button" class="btn btn-sm border border-2 text-capitalize mb-1"
                :class="{ 'bg-secondary-subtle': expiration == '10 minute' }"
                @click="setExpiration('10 minute'); exp = '10m'">10
                minute
              </div>
              <div type="button" class="btn btn-sm border border-2 text-capitalize mb-1"
                :class="{ 'bg-secondary-subtle': expiration == '1 hour' }" @click="setExpiration('1 hour'); exp = '1h'">1
                hour</div>
              <div type="button" class="btn btn-sm border border-2 text-capitalize mb-1"
                :class="{ 'bg-secondary-subtle': expiration == '1 day' }" @click="setExpiration('1 day'); exp = '1d'">1
                day
              </div>
              <div type="button" class="btn btn-sm border border-2 text-capitalize mb-1"
                :class="{ 'bg-secondary-subtle': expiration == '1 week' }" @click="setExpiration('1 week'); exp = '1w'">1
                week</div>
              <div type="button" class="btn btn-sm border border-2 text-capitalize mb-1"
                :class="{ 'bg-secondary-subtle': expiration == '1 month' }"
                @click="setExpiration('1 month'); exp = '1mo'">1
                month
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-sm btn-secondary" data-bs-dismiss="modal">Cancel</button>
          </div>
        </div>
      </div>
    </div>

    <div class="modal fade" id="protectModal" tabindex="-1" aria-labelledby="protectModalLabel" aria-hidden="true">
      <div class="modal-dialog text-dark">
        <div class="modal-content">
          <div class="modal-header">
            <h3 class="modal-title fs-5 fw-bold" id="protectModalLabel">Password Protect</h3>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" id="closeprotectModal"
              @click="setPassword"></button>
          </div>
          <div class="modal-body">
            <p>Enter a password with which to encrypt this paste, or leave it blank to eschew encryption.</p>
            <div class="w-100 text-start">
              <div class="col-7">
                <div class="input-group mb-3">
                  <span class="input-group-text" id="basic-addon1">
                    <i class="fa fa-key"></i>
                  </span>
                  <input type="password" class="form-control" placeholder="Password" id="password"
                    v-on:keyup.enter="setPassword">
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-sm btn-secondary" data-bs-dismiss="modal"
              @click="setPassword">Okay</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// import '~/node_modules/bootstrap/dist/css/bootstrap.min.css'
import axios from "axios";

export default {
  name: 'Home',
  data() {
    return {
      text: '',
      lines: 1,
      paste_name: '',
      expiration: 'never',
      password: '',
      language_list: [
        'Plain Text',
        'Python',
        'C++',
        'PHP',
        'GO',
        'HTML',
        'CSS',
        'JavaScript',
        'Perl',
        'Java',
        'Ruby',
      ],
      exp: '',
      language_selected: 'Plain Text'
    }
  },
  mounted() {
    this.setLines()
    window.addEventListener('keydown', this.handleKeyDown);

  },
  beforeDestroy() {
    window.removeEventListener('keydown', this.handleKeyDown);
  },
  methods: {
    handleKeyDown(event) {
      if (event.ctrlKey && event.key === 'Enter') {
        // Panggil fungsi xxx di sini
        this.save();
      }
    },
    save() {
      let language = this.language_selected.toLowerCase();
      if (language == 'plain text') {
        language = null
      }
      axios.post('/post', this.text, {
        headers: {
          'Content-Type': 'text/plain',
          'options': JSON.stringify({
            password: this.password,
            expired: this.expiration,
            language: language,
            name: this.paste_name
          })
        }
      })
        .then(response => {
          
          if(response.status == 200){
            window.location.href = '/'+response.data.path;
          }
        })
        .catch(error => {
          if(error.response.status == 400){
            this.$toast.error(error.response.data.message);
          }else{
            this.$toast.error('Something went wrong!, please try again later.');
          }
          this.focusTextarea()
        });

    },
    setPassword() {
      let password = document.getElementById('password').value
      this.password = password
      document.getElementById('closeprotectModal').click()
    },
    setExpiration(expiration) {
      this.expiration = expiration
      // alert(this.expiration)
      let close = document.getElementById('closeExpirationModal')
      close.click()
    },
    setLines() {
      var lines = 1; // Inisialisasi jumlah baris dengan 1

      // Menghitung jumlah karakter baris baru (\n)
      for (var i = 0; i < this.text.length; i++) {
        if (this.text.charAt(i) === '\n') {
          lines++;
        }
      }
      this.lines = lines
      // return lines;
    },
    focusPassword() {
      document.getElementById('password').value = this.password
      setInterval(() => {
        document.getElementById('password').focus()
      }, 500)
    },
    focusTextarea() {
      document.getElementById('text').focus()
    }
  },
  watch: {
    text: function () {
      this.setLines()
    }
  }
}
</script>