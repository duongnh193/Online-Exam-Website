import React from 'react';
import { Row, Col } from 'react-bootstrap';
import styled from 'styled-components';
import resourcePlaceholder from '../../assets/images/resource-placeholder.svg';
import resourceIcon1 from '../../assets/images/resource-icon-1.svg';

// Styled components
const ResourceSectionWrapper = styled.section`
  background-color: #ffffff;
  padding: 80px 0;
  position: relative;

  @media (max-width: 991.98px) {
    padding: 60px 0;
  }

  @media (max-width: 767.98px) {
    padding: 40px 0;
  }
`;

const ContentWrapper = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 30px;
`;

const SectionTitle = styled.h2`
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: #333;
`;

const SectionDescription = styled.p`
  font-size: 1.1rem;
  color: #666;
  margin-bottom: 2rem;
  max-width: 80%;
`;

const ResourceGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-top: 30px;
  
  @media (max-width: 767.98px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 575.98px) {
    grid-template-columns: 1fr;
  }
`;

const ResourceItem = styled.div`
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 15px;
  transition: all 0.3s ease;
  cursor: pointer;
  
  &:hover {
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
    transform: translateY(-2px);
  }
`;

const ResourceIcon = styled.img`
  width: 100%;
  height: auto;
  max-width: 80px;
  margin-bottom: 10px;
`;

const ResourceTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0;
`;

const FeaturedResourceCard = styled.div`
  border: 1px solid #eee;
  border-radius: 12px;
  overflow: hidden;
  height: 100%;
  display: flex;
  flex-direction: column;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.05);
  
  @media (max-width: 991.98px) {
    margin-top: 40px;
  }
`;

const FeaturedResourceImage = styled.img`
  width: 100%;
  height: auto;
`;

const FeaturedResourceContent = styled.div`
  padding: 20px;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
`;

const FeaturedResourceTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 10px;
`;

const FeaturedResourceDescription = styled.p`
  color: #666;
  font-size: 0.95rem;
  margin-bottom: 0;
  flex-grow: 1;
`;

const ResourceSection = () => {
  // Sample resource items data
  const resourceItems = [
    { id: 1, title: 'Resource Item 1', icon: resourceIcon1 },
    { id: 2, title: 'Resource Item 2', icon: resourceIcon1 },
    { id: 3, title: 'Resource Item 3', icon: resourceIcon1 },
    { id: 4, title: 'Resource Item 4', icon: resourceIcon1 },
    { id: 5, title: 'Resource Item 5', icon: resourceIcon1 },
    { id: 6, title: 'Resource Item 6', icon: resourceIcon1 },
  ];

  return (
    <div id="resource-section" style={{ padding: '2rem 0', backgroundColor: '#f9f9f9' }}>
      <ResourceSectionWrapper>
        <ContentWrapper>
          <Row className="g-5">
            {/* Left column with resources */}
            <Col lg={6} md={12}>
              <SectionTitle>You're in good company</SectionTitle>
              <SectionDescription>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore
              </SectionDescription>
              
              <ResourceGrid>
                {resourceItems.map(item => (
                  <ResourceItem key={item.id}>
                    <ResourceIcon src={item.icon} alt={item.title} />
                    <ResourceTitle>{item.title}</ResourceTitle>
                  </ResourceItem>
                ))}
              </ResourceGrid>
            </Col>
            
            {/* Right column with featured resource */}
            <Col lg={6} md={12}>
              <FeaturedResourceCard>
                <FeaturedResourceImage 
                  src={resourcePlaceholder} 
                  alt="Featured resource" 
                />
                <FeaturedResourceContent>
                  <FeaturedResourceTitle>Sed ut perspiciatis unde omnis</FeaturedResourceTitle>
                  <FeaturedResourceDescription>
                    Nemo enim ipsam voluptatem quia voluptas sit aspernatur 
                    aut odit aut fugit, sed quia consequuntur magni dolores eos 
                    qui ratione voluptatem sequi nesciunt. Neque porro 
                    quisquam est, qui dolorem ipsum quia dolor sit amet.
                  </FeaturedResourceDescription>
                </FeaturedResourceContent>
              </FeaturedResourceCard>
            </Col>
          </Row>
        </ContentWrapper>
      </ResourceSectionWrapper>
    </div>
  );
};

export default ResourceSection; 