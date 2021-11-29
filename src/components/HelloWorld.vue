<template>
  <h1>S3 Test</h1>
  <input type="file" class="uploader" ref="fileInput" @change="handleFileUpload">
  <input type="button" value="UPLOAD" @click="uploadFile">
  <input type="button" value="READ" @click="readFiles">
  <div class="images">
    <div class="images__s3image" v-for="image in images" :key="image.Key">
      <img :src="image.src" :alt="image.Key" class="images__s3image">
      <input type="button" value="X" class="images__delete" @click="deleteImage(image.Key)">
    </div>
  </div>
</template>

<script>
import { ref, reactive } from "vue";
import AWSS3Handler from "./AWSS3Handler";

export default {
  setup() {
    // 객체 생성 시 매개 변수로 article_id를 넘긴다.
    const awsS3Handler = new AWSS3Handler(/* article_id */);

    const images = reactive([]);

    const fileInput = ref(null);
    let file;

    /** AWS S3에서 파일 읽어오기 */
    const readFiles = async () => {
      images.length = 0; // 배열을 비움
      images.push(...(await awsS3Handler.readAll()));
    };

    // 파일 등록 input 박스에 이벤트가 발생했을 경우
    const handleFileUpload = () => {
      file = fileInput.value.files[0];
      console.log(`File Upload: ${file.name}\n`, { file });
    };

    /** AWS S3에 파일 등록하기 */
    const uploadFile = async () => {
      await awsS3Handler.upload(file.name, file); // 아마도 여기에는 넘버링 된 파일 이름으로 호출될 것
      await readFiles();
    };

    /** AWS S3에 파일 삭제하기 */
    const deleteImage = async (key) => {
      await awsS3Handler.delete(key);
      await readFiles();
    };

    return {
      images,
      fileInput,
      handleFileUpload,
      uploadFile,
      readFiles,
      deleteImage,
    }
  }
}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}

.images {
  display: flex;
  flex-wrap: wrap;
}
</style>
