import styled from 'styled-components'


const FileImage = styled.div `
    background-image: url(${props => props.image});
    background-size: cover;
    background-position: center;
`

export default FileImage;