<template>
    <div>
        <nav class="navbar navbar-expand-md navbar-dark">
            <div class="container-fluid">
                <!-- <a class="navbar-brand" href="#">Navbar</a> -->
                <ul class="navbar-nav me-auto my-auto w-100">
                    <li class="nav-item">
                        <input type="text" class="bg-transparent text-light border-0 paste-name-input" v-model="paste_name"
                            placeholder="New Paste" readonly>
                    </li>
                </ul>
                <div class="collapse navbar-collapse" id="navbarSupportedContent">
                    <ul class="navbar-nav me-auto my-auto">
                    </ul>
                    <div class="mr-0">
                        <ul class="navbar-nav" v-if="error == false && this.isLoading == false">
                            <li class="nav-item">
                                <a class="nav-link active text-white border border-1 rounded mx-1 py-0 px-3 icon-menu"
                                    type="button" title="View Raw" :href="to_raw_path">
                                    <i class="fa fa-file-text-o"></i>
                                </a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link active text-white border border-1 rounded mx-1 py-0 px-3 icon-menu"
                                    type="button" title="Copy Raw to clipboard" @click="copyRaw()">
                                    <i class="fa fa-clipboard"></i>
                                </a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link active text-white border border-1 rounded mx-1 py-0 px-3 icon-menu"
                                    type="button" title="Download" @click="download()">
                                    <i class="fa fa-download"></i>
                                </a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link active text-white border border-1 rounded mx-1 py-0 px-3 icon-menu"
                                    type="button" title="Start a new text" href="/">
                                    <i class="fa fa-plus"></i>
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </nav>
        <div class="pt-0 raw-input overflow-auto" v-if="error == false && this.isLoading == false">
            <div class="d-flex">
                <div class="col-auto">
                    <div class="lines user-select-none">
                        <span class="d-inline-grid w-100">
                            <span v-for="i in lines" class="border-end border-color px-2 me-2">
                                {{ i }}
                            </span>
                            <br>
                        </span>
                    </div>
                </div>

                <div class="col">
                    <pre><code ref="codeElement" class="javascript p-0">{{ text }}</code></pre>
                    <!-- <code v-highlight="code" class="javascript">console.log('Hello World')</code> -->
                </div>
            </div>
        </div>

        <div v-show="isLoading == true">
            <div class="position-fixed d-flex justify-content-center align-items-center w-100 h-100 top-0 start-0">
                <div class="spinner">
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                </div>
            </div>
        </div>



        <div class="px-3 pt-5 p-error" v-if="statusCode == 404">
            <div class="p-3 rounded">
                <span>
                    The requested file, named "<b>{{ paste_id }}</b>", cannot be found. <br>
                    <NuxtLink to="/" class="text-decoration-none">Go to the homepage and try again.</NuxtLink>
                </span>
            </div>
        </div>

        <div class="px-3 pt-5 p-error p-error_401" v-if="statusCode == 401">
            <div class="p-3 rounded">
                <span>
                    Secure paste <b>{{ paste_id }}</b>. Password required for access.
                    <div class="d-flex mt-2 col-12 col-sm-6 col-md-4 col-lg-3">
                        <div class="input-group mb-3">
                            <span class="input-group-text" id="basic-addon1">
                                <i class="fa fa-key"></i>
                            </span>
                            <input type="password" class="form-control form-control-sm" placeholder="Password"
                                v-model="password" v-on:keyup.enter="Unlock" autofocus>
                            <button class="btn btn-sm btn-primary" @click="Unlock">Unlock</button>
                        </div>
                    </div>
                </span>
            </div>
        </div>

        <div class="d-md-none bg-dark text-light mobile-menu user-select-none"
            v-if="error == false && this.isLoading == false">
            <ul class="list-group mt-3">
                <li class="list-group-item border-0 p-1 d-flex">
                    <div class="col-6">
                        <a class="nav-link active text-white border border-1 rounded mx-1 py-0 px-3 icon-menu text-center"
                            :href="to_raw_path">
                            <i class="fa fa-file-text-o"></i> <span class="ps-1">View Raw</span>
                        </a>
                    </div>
                    <div class="col-6">
                        <a class="nav-link active text-white border border-1 rounded mx-1 py-0 px-3 icon-menu text-center"
                            type="button" @click="download()">
                            <i class="fa fa-download"></i> <span class="ps-1">Download</span>
                        </a>
                    </div>
                </li>
                <li class="list-group-item border-0 p-1">
                    <a href="/"
                        class="nav-link active text-white border border-1 rounded mx-1 py-0 px-3 icon-menu text-center pb-1"
                        style="padding-bottom: 7px !important">
                        <i class="fa fa-plus"></i> <span class="ps-1">Start a new text</span>
                    </a>
                </li>
            </ul>
        </div>
    </div>
</template>

<script>
import axios from "axios";
import crypto from "crypto";
export default {
    name: 'ReadPaste',
    data() {
        return {
            isLoading: true,
            lines: 0,
            text: ``,
            worker: null,
            paste_id: '',
            paste_name: '',
            language: '',
            expired_time: '',
            error: false,
            statusCode: 0,
            password: '',
            to_raw_path: '',
            hashPassword: '',
        }
    },
    mounted() {
        this.paste_id = this.$route.params.id // window.location.pathname
        if (!this.paste_id) {
            const path = this.$route.path
            this.paste_id = path.split('/')[1]
        }
        this.isLoading = true
        // this.worker = new Worker('/api/highlightWorker.js?lang=php');
        this.hashPassword = this.getCookie("p" + this.paste_id)
        this.load_raw()
    },
    beforeUnmount() {
        this.worker.terminate();
    },
    methods: {
        copyRaw() {
            const textToCopy = this.text;
            const tempTextArea = document.createElement('textarea');
            tempTextArea.value = textToCopy;
            document.body.appendChild(tempTextArea);
            tempTextArea.select();

            try {
                document.execCommand('copy');
                this.$toast.success('Successfully copied text');
            } catch (err) {
                this.$toast.error('Failed to copy text');
            }

            document.body.removeChild(tempTextArea);
        },
        download() {
            // download with a href
            let langDefault = 'txt'
            let extensions = {
                'python': 'py',
                'c++': 'cpp',
                'php': 'php',
                'go': 'go',
                'html': 'html',
                'css': 'css',
                'javascript': 'js',
                'perl': 'pl',
                'java': 'java',
                'ruby ': 'rb',
            }
            let ext = extensions[this.language]
            if (!ext) {
                ext = langDefault
            }

            const unsupportedCharsRegex = /[<>:"/\\|?*]/g; // Daftar karakter yang tidak didukung
            const filename = this.paste_name.replace(unsupportedCharsRegex, "-"); // Ganti karakter yang tidak didukung dengan "-"

            var a = document.createElement('a');
            a.href = '/raw/' + this.paste_id;
            a.download = filename + '.' + ext;
            a.click();
        },
        highlightCode() {
            this.worker = new Worker('/api/highlightWorker.js?lang=' + encodeURI(this.language));

            this.worker.onmessage = (event) => {
                this.$refs.codeElement.innerHTML = event.data;
            };
            this.worker.postMessage(this.text);
        },
        load_raw(isLogin = false) {
            this.isLoading = true
            this.error = false
            axios.get(`/raw/${this.paste_id}${this.hashPassword == '' ? '' : ('/' + this.hashPassword)}`)
                .then(response => {
                    if (response.status == 200) {
                        this.text = response.data
                        let info = response.headers['info']
                        // console.log(info)
                        info = JSON.parse(info)
                        this.language = info.language
                        this.expired_time = info.expired_time
                        this.paste_name = info.name ?? 'Untitled'
                        this.highlightCode()
                        this.setLines()
                        this.setToRaw()
                        if (this.paste_name !== 'Untitled') {
                            document.title = this.paste_name + ' - ' + document.title
                        }
                        if (info.hash_pwd) {
                            this.setCookie('p' + this.paste_id, info.hash_pwd)
                        }
                    } else {
                        console.log(response.status)
                        this.$toast.error('Something went wrong!, please try again later.')
                    }
                }).catch(error => {
                    this.error = true
                    if (error.response.status == 404) {
                        this.statusCode = 404
                        this.paste_name = '404 - File Not Found';
                    } else if (error.response.status == 401) {
                        this.statusCode = 401
                        this.paste_name = 'Untitled'
                        if (isLogin) {
                            this.$toast.error(error.response.data)
                        }
                    }
                }).finally(() => {
                    this.isLoading = false
                })
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
        },
        setToRaw() {
            this.to_raw_path = `/raw/${this.paste_id}${this.hashPassword == '' ? '' : ('/' + this.hashPassword)}`
        },
        Unlock() {
            if (this.password != '') {
                this.statusCode = 0
                this.hashPassword = crypto.createHash('sha256').update(this.password).digest('hex').substr(0, 20);
                this.load_raw(true)
            } else {
                this.$toast.error('Please enter password')
            }
        },
        setCookie(name, value) {
            const date = new Date();
            date.setTime(date.getTime() + (3 * 60 * 60 * 1000)); // 3 jam dalam milidetik
            const expires = "expires=" + date.toUTCString();
            document.cookie = name + "=" + value + ";" + expires + ";path=/";
        }, getCookie(name) {
            const cookieName = name + "=";
            const decodedCookie = decodeURIComponent(document.cookie);
            const cookieArray = decodedCookie.split(';');

            for (let i = 0; i < cookieArray.length; i++) {
                let cookie = cookieArray[i];
                while (cookie.charAt(0) === ' ') {
                    cookie = cookie.substring(1);
                }
                if (cookie.indexOf(cookieName) === 0) {
                    return cookie.substring(cookieName.length, cookie.length);
                }
            }
            return "";
        }
    },
}
</script>