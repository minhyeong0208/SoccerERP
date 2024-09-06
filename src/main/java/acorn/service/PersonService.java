package acorn.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import acorn.entity.Person;
import acorn.repository.PersonRepository;

@Service
public class PersonService {

    private final PersonRepository personRepository;

    @Autowired
    public PersonService(PersonRepository personRepository) {
        this.personRepository = personRepository;
    }

    // 모든 사람 조회 (페이징 처리)
    public Page<Person> getAllPersons(Pageable pageable) {
        return personRepository.findAllWithAbility(pageable);
    }

    // 모든 사람 조회 (페이징 없이)
    public List<Person> getAllPersons() {
        return personRepository.findAll();
    }

    // 모든 선수 조회 (능력치 포함, 페이징 없이)
    public List<Person> getAllPersonsWithAbility() {
        return personRepository.findAllWithAbility();
    }

    // 역할 구분에 따른 조회 (선수/코치)
    public List<Person> getPersonsByTypeCode(String typeCode) {
        return personRepository.findByTypeCode(typeCode);
    }

    // 선수명 또는 포지션 검색
    public List<Person> searchPersons(String personName, String position) {
        return personRepository.searchByPersonNameOrPosition(personName, position);
    }

    // 특정 사람 조회
    public Person getPersonById(int personIdx) {
        return personRepository.findById(personIdx).orElse(null);
    }

    // 새로운 사람 추가
    public Person addPerson(Person person) {
        // 양방향 관계 설정
        if (person.getAbility() != null) {
            person.getAbility().setPerson(person);
        }
        return personRepository.save(person);
    }

    // 사람 업데이트
    public Person updatePerson(int personIdx, Person personDetails) {
        Person person = getPersonById(personIdx);
        if (person != null) {
            person.setPersonName(personDetails.getPersonName());
            person.setTeamIdx(personDetails.getTeamIdx());
            person.setFacilityIdx(personDetails.getFacilityIdx());
            person.setHeight(personDetails.getHeight());
            person.setWeight(personDetails.getWeight());
            person.setBirth(personDetails.getBirth());
            person.setPosition(personDetails.getPosition());
            person.setBackNumber(personDetails.getBackNumber());
            person.setNationality(personDetails.getNationality());
            person.setContractStart(personDetails.getContractStart());
            person.setContractEnd(personDetails.getContractEnd());
            person.setId(personDetails.getId());
            person.setPhone(personDetails.getPhone());
            person.setGender(personDetails.getGender());
            person.setEmail(personDetails.getEmail());
            person.setTypeCode(personDetails.getTypeCode());
            person.setPersonImage(personDetails.getPersonImage());
            return personRepository.save(person);
        }
        return null;
    }

    // 사람 삭제
    public void deletePerson(int personIdx) {
        personRepository.deleteById(personIdx);
    }
    
    // 다중 삭제 메서드
    public void deletePersons(List<Integer> personIds) {
        personRepository.deleteAllByIdInBatch(personIds);
    }
}
