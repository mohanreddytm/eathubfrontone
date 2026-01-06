import styled from 'styled-components'

const MainBack =  styled.div`
    background-image: url(${props => props.image || '#f0f0f0'});
    background-size:cover;
`

export default MainBack;